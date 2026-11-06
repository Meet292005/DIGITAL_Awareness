import re

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import LearningCategory, LearningModule, Lesson, LessonProgress, UserAchievement, UserPoints

User = get_user_model()


class AwarenessApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_content", verbosity=0)

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="learner", email="learner@example.test", password="StrongPass123!")
        self.lesson = LearningModule.objects.get(slug="phishing-attacks").lessons.first()

    @staticmethod
    def correct_answers(lesson):
        return [question["correct_index"] for question in lesson.knowledge_check]

    @staticmethod
    def incorrect_answers(lesson):
        return [(question["correct_index"] + 1) % len(question["options"]) for question in lesson.knowledge_check]

    def test_registration_hashes_password_and_does_not_allow_role_escalation(self):
        response = self.client.post("/api/auth/register/", {
            "username": "new-learner",
            "email": "new@example.test",
            "password": "AnotherStrong123!",
            "role": "admin",
            "is_staff": True,
        }, format="json")
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username="new-learner")
        self.assertTrue(user.check_password("AnotherStrong123!"))
        self.assertFalse(user.is_staff)
        self.assertEqual(user.role, User.Role.LEARNER)

    def test_jwt_login_authenticates_dashboard_requests(self):
        response = self.client.post("/api/auth/token/", {
            "username": self.user.username,
            "password": "StrongPass123!",
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        dashboard = self.client.get("/api/dashboard/")
        self.assertEqual(dashboard.status_code, 200)
        self.assertIsNone(dashboard.data["leaderboard_position"])

    def test_lesson_completion_requires_passing_score_and_awards_points_once(self):
        self.client.force_authenticate(self.user)
        failed = self.client.post(f"/api/lessons/{self.lesson.id}/complete/", {
            "answers": self.incorrect_answers(self.lesson),
        }, format="json")
        self.assertEqual(failed.status_code, 200)
        self.assertFalse(failed.data["passed"])
        self.assertEqual(UserPoints.objects.get(user=self.user).total_points, 0)

        correct_answers = self.correct_answers(self.lesson)
        passed = self.client.post(f"/api/lessons/{self.lesson.id}/complete/", {
            "answers": correct_answers,
        }, format="json")
        self.assertTrue(passed.data["passed"])
        self.assertEqual(passed.data["points_awarded"], 20)
        self.assertTrue(LessonProgress.objects.get(user=self.user, lesson=self.lesson).completed)
        self.assertTrue(UserAchievement.objects.filter(user=self.user, achievement__slug="phishing-expert").exists())
        dashboard = self.client.get("/api/dashboard/")
        self.assertEqual(dashboard.data["leaderboard_position"], 1)

        repeated = self.client.post(f"/api/lessons/{self.lesson.id}/complete/", {
            "answers": correct_answers,
        }, format="json")
        self.assertEqual(repeated.data["points_awarded"], 0)
        self.assertEqual(UserPoints.objects.get(user=self.user).total_points, 20)

    def test_public_module_listing_hides_unpublished_content_and_quiz_answers(self):
        private_module = LearningModule.objects.create(
            category=self.lesson.module.category,
            title="Private draft",
            slug="private-draft",
            description="Not published",
        )
        response = self.client.get("/api/modules/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn(private_module.id, [row["id"] for row in response.data["results"]])
        phishing = next(row for row in response.data["results"] if row["slug"] == "phishing-attacks")
        self.assertEqual(len(phishing["lessons"][0]["questions"]), 5)
        self.assertNotIn("correct_index", str(phishing["lessons"]))

    def test_each_starter_module_has_topic_specific_questions(self):
        response = self.client.get("/api/modules/")
        self.assertEqual(response.status_code, 200)
        modules = response.data["results"]
        first_questions = {
            module["lessons"][0]["questions"][0]["prompt"]
            for module in modules
        }
        self.assertEqual(len(modules), 10)
        self.assertEqual(len(first_questions), 10)
        for module in modules:
            for question in module["lessons"][0]["questions"]:
                self.assertNotIn("correct_index", question)

    def test_admin_analytics_requires_staff_permissions(self):
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get("/api/admin/analytics/").status_code, 403)
        self.assertEqual(self.client.get("/api/admin/students/").status_code, 403)
        staff = User.objects.create_superuser(username="admin", email="admin@example.test", password="StrongAdmin123!")
        self.client.force_authenticate(staff)
        self.assertEqual(self.client.get("/api/admin/analytics/").status_code, 200)

    def test_admin_overview_includes_learner_progress_and_platform_totals(self):
        self.client.force_authenticate(self.user)
        completion = self.client.post(
            f"/api/lessons/{self.lesson.id}/complete/",
            {"answers": self.correct_answers(self.lesson)},
            format="json",
        )
        self.assertTrue(completion.data["passed"])
        inactive = User.objects.create_user(username="inactive", email="inactive@example.test", password="StrongPass123!")
        inactive.is_active = False
        inactive.save(update_fields=["is_active"])

        admin = User.objects.create_superuser(username="overview-admin", email="overview@example.test", password="StrongPass123!")
        self.client.force_authenticate(admin)
        analytics = self.client.get("/api/admin/analytics/")
        self.assertEqual(analytics.status_code, 200)
        self.assertEqual(analytics.data["students"], 2)
        self.assertEqual(analytics.data["active_students"], 1)
        self.assertEqual(analytics.data["inactive_students"], 1)
        self.assertEqual(analytics.data["completions"], 1)
        self.assertEqual(analytics.data["points_awarded"], 20)
        self.assertEqual(analytics.data["module_progress"], [{
            "lesson__module__title": self.lesson.module.title,
            "completions": 1,
        }])

        students = self.client.get("/api/admin/students/")
        self.assertEqual(students.status_code, 200)
        learner = next(row for row in students.data["results"] if row["id"] == self.user.id)
        self.assertEqual(learner["points"], 20)
        self.assertEqual(learner["completed_lessons"], 1)
        self.assertEqual(learner["learning_streak"], 1)
        self.assertIsNotNone(learner["last_activity_date"])

    def test_completion_rejects_missing_answers(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(f"/api/lessons/{self.lesson.id}/complete/", {"answers": [1]}, format="json")
        self.assertEqual(response.status_code, 400)
        invalid = self.client.post(
            f"/api/lessons/{self.lesson.id}/complete/",
            {"answers": [1, 1, 0, 1, 1.5]},
            format="json",
        )
        self.assertEqual(invalid.status_code, 400)

    def test_password_reset_email_and_token_update_password(self):
        response = self.client.post("/api/auth/password-reset/", {"email": self.user.email}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        match = re.search(r"/reset-password/([^/\s]+)/([^/\s]+)", mail.outbox[0].body)
        self.assertIsNotNone(match)
        uid, token = match.groups()
        reset = self.client.post(
            f"/api/auth/password-reset/{uid}/{token}/",
            {"password": "ReplacementPass123!"},
            format="json",
        )
        self.assertEqual(reset.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ReplacementPass123!"))

    def test_profile_can_be_updated_without_changing_role(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch("/api/auth/profile/", {
            "first_name": "Asha",
            "college": "City College",
            "role": "admin",
            "is_staff": True,
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Asha")
        self.assertEqual(self.user.profile.college, "City College")
        self.assertFalse(self.user.is_staff)

    def test_overview_reports_published_content_and_leaderboard_hides_usernames(self):
        overview = self.client.get("/api/overview/")
        self.assertEqual(overview.status_code, 200)
        self.assertEqual(overview.data["modules"], 10)
        self.assertEqual(overview.data["knowledge_checks"], 50)

        self.client.force_authenticate(self.user)
        self.client.post(f"/api/lessons/{self.lesson.id}/complete/", {
            "answers": self.correct_answers(self.lesson),
        }, format="json")
        self.client.force_authenticate(None)
        leaderboard = self.client.get("/api/leaderboard/")
        self.assertEqual(leaderboard.status_code, 200)
        self.assertNotIn("username", leaderboard.data[0])
        self.assertNotIn("user_id", leaderboard.data[0])

    def test_admin_can_create_categories_and_cannot_delete_a_category_in_use(self):
        admin = User.objects.create_superuser(username="category-admin", email="category@example.test", password="StrongAdmin123!")
        self.client.force_authenticate(admin)
        category = LearningCategory.objects.get(slug="fraud-scams")
        response = self.client.delete(f"/api/categories/{category.id}/")
        self.assertEqual(response.status_code, 400)
        created = self.client.post("/api/categories/", {
            "name": "Account safety",
            "slug": "account-safety",
            "description": "Account protection lessons.",
        }, format="json")
        self.assertEqual(created.status_code, 201)

    def test_staff_can_manage_modules_and_learners_but_learners_cannot(self):
        admin = User.objects.create_superuser(username="content-admin", email="content@example.test", password="StrongAdmin123!")
        self.client.force_authenticate(admin)
        category = LearningCategory.objects.get(slug="fraud-scams")
        created = self.client.post("/api/modules/", {
            "category": category.id,
            "title": "New awareness path",
            "slug": "new-awareness-path",
            "description": "A staff-authored path.",
            "difficulty": "beginner",
            "estimated_minutes": 8,
        }, format="json")
        self.assertEqual(created.status_code, 201)
        updated = self.client.patch("/api/modules/new-awareness-path/", {"description": "Updated by staff."}, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["description"], "Updated by staff.")
        rejected_publish = self.client.patch(
            "/api/modules/new-awareness-path/",
            {"is_published": True},
            format="json",
        )
        self.assertEqual(rejected_publish.status_code, 400)
        Lesson.objects.create(
            module_id=created.data["id"],
            title="Starter lesson",
            content="Educational content.",
            position=1,
            knowledge_check=[{"prompt": "Check?", "options": ["Yes", "No"], "correct_index": 0}],
        )
        published = self.client.patch(
            "/api/modules/new-awareness-path/",
            {"is_published": True},
            format="json",
        )
        self.assertEqual(published.status_code, 200)
        self.assertTrue(published.data["is_published"])

        self.client.force_authenticate(self.user)
        denied = self.client.patch("/api/modules/new-awareness-path/", {"is_published": False}, format="json")
        self.assertEqual(denied.status_code, 403)
        deactivated = self.client.patch(
            f"/api/admin/students/{self.user.id}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(deactivated.status_code, 403)

        self.client.force_authenticate(admin)
        deactivated = self.client.patch(
            f"/api/admin/students/{self.user.id}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(deactivated.status_code, 200)
        self.assertFalse(deactivated.data["is_active"])
        self.assertIn("points", deactivated.data)
        self.assertIn("completed_lessons", deactivated.data)
        self.assertIn("learning_streak", deactivated.data)

    def test_completion_certificate_unlocks_after_all_published_lessons(self):
        self.client.force_authenticate(self.user)
        initial = self.client.get("/api/dashboard/")
        self.assertFalse(initial.data["certificate_earned"])
        for lesson in Lesson.objects.filter(module__is_published=True):
            response = self.client.post(
                f"/api/lessons/{lesson.id}/complete/",
                {"answers": self.correct_answers(lesson)},
                format="json",
            )
            self.assertTrue(response.data["passed"])
        dashboard = self.client.get("/api/dashboard/")
        self.assertTrue(dashboard.data["certificate_earned"])
        self.assertEqual(dashboard.data["completed_lessons"], 10)
        self.assertIsNotNone(dashboard.data["certificate_issued_at"])
        self.assertTrue(UserAchievement.objects.filter(user=self.user, achievement__slug="cyber-safety-champion").exists())

        self.lesson.module.is_published = False
        self.lesson.module.save(update_fields=["is_published"])
        self.assertTrue(self.client.get("/api/dashboard/").data["certificate_earned"])
