from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Count, F, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status, viewsets
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView

from .models import (
    Achievement,
    LearningActivity,
    LearningCategory,
    LearningModule,
    Lesson,
    LessonProgress,
    UserAchievement,
    UserPoints,
)
from .permissions import PublishedReadOnlyOrAdmin
from .serializers import (
    AdminStudentSerializer,
    LearningCategorySerializer,
    LearningModuleSerializer,
    ProfileSerializer,
    RegistrationSerializer,
)

User = get_user_model()
POINTS_PER_LESSON = 20


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]


class SetupAdminView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return self._setup(request)

    def post(self, request):
        return self._setup(request)

    def _setup(self, request):
        import os
        admin_user = os.environ.get("ADMIN_USERNAME", "admin")
        admin_pass = os.environ.get("ADMIN_PASSWORD", "Admin@123456")
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@digiaware.local")

        user, created = User.objects.get_or_create(
            username=admin_user,
            defaults={
                "email": admin_email,
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            }
        )
        user.is_staff = True
        user.is_superuser = True
        user.role = User.Role.ADMIN
        user.is_active = True
        user.set_password(admin_pass)
        user.save()

        return Response({
            "status": "success",
            "message": f"Superuser '{admin_user}' is ready with full dashboard access.",
            "username": admin_user,
            "created": created,
        })


class TokenObtainPairViewWithThrottle(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        email = request.data.get("email", "")
        if not isinstance(email, str):
            return Response({"email": "Enter a valid email address."}, status=status.HTTP_400_BAD_REQUEST)
        from django.core.validators import validate_email
        try:
            validate_email(email)
        except ValidationError:
            return Response({"email": "Enter a valid email address."}, status=status.HTTP_400_BAD_REQUEST)
        for user in User.objects.filter(email__iexact=email, is_active=True):
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}"
            send_mail(
                "Reset your DigiAware password",
                f"Use this link to choose a new password: {reset_url}\n\nIf you did not request this, you can ignore this email.",
                None,
                [user.email],
                fail_silently=False,
            )
        return Response({"detail": "If an account exists for that email, a password reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uid, token):
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        password = request.data.get("password")
        if user is None or not default_token_generator.check_token(user, token):
            return Response({"detail": "This password reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if not isinstance(password, str):
                raise ValidationError("Enter a password.")
            validate_password(password, user)
        except ValidationError as err:
            messages = list(err.messages) if hasattr(err, "messages") else ["Choose a stronger password."]
            return Response({"password": messages}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save(update_fields=["password"])
        return Response({"detail": "Your password has been updated. You can now sign in."})


class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = LearningModuleSerializer
    permission_classes = [PublishedReadOnlyOrAdmin]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = LearningModule.objects.select_related("category").prefetch_related("lessons")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(is_published=True)

    def perform_create(self, serializer):
        if serializer.validated_data.get("is_published", False):
            raise serializers.ValidationError({"is_published": "Add at least one lesson before publishing this module."})
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        should_publish = serializer.validated_data.get("is_published", serializer.instance.is_published)
        if should_publish and not serializer.instance.lessons.exists():
            raise serializers.ValidationError({"is_published": "Add at least one lesson before publishing this module."})
        serializer.save()


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = LearningCategorySerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = LearningCategory.objects.all()

    def destroy(self, request, *args, **kwargs):
        from django.db.models.deletion import ProtectedError

        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "This category is assigned to learning modules and cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )


def _award_eligible_achievements(user, lesson):
    completed = LessonProgress.objects.filter(user=user, completed=True).select_related("lesson__module__category")
    count = completed.count()
    slugs = set(completed.values_list("lesson__module__slug", flat=True))
    categories = set(completed.values_list("lesson__module__category__slug", flat=True))
    earned = []
    criteria = {
        "cyber-beginner": count >= 1,
        "scam-detective": bool(categories & {"fraud-scams", "online-shopping-scams"}) or "phishing-attacks" in slugs,
        "privacy-guardian": bool(categories & {"digital-privacy", "social-media-security"}) or "digital-privacy" in slugs,
        "phishing-expert": "phishing-attacks" in slugs,
        "cyber-safety-champion": count >= 10,
    }
    for slug, eligible in criteria.items():
        if eligible:
            achievement = Achievement.objects.filter(slug=slug).first()
            if achievement:
                _, created = UserAchievement.objects.get_or_create(user=user, achievement=achievement)
                if created:
                    earned.append(achievement.name)
    return earned


class LessonCompletionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson.objects.select_related("module"), id=lesson_id, module__is_published=True)
        answers = request.data.get("answers")
        questions = lesson.knowledge_check
        if not isinstance(answers, list) or len(answers) != len(questions):
            return Response({"answers": "Submit one answer for every knowledge-check question."}, status=status.HTTP_400_BAD_REQUEST)
        if not questions:
            return Response({"detail": "This lesson does not have a knowledge check yet."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            valid_questions = all(
                isinstance(question, dict)
                and isinstance(question.get("options"), list)
                and type(question.get("correct_index")) is int
                and 0 <= question["correct_index"] < len(question["options"])
                for question in questions
            )
        except TypeError:
            valid_questions = False
        if not valid_questions:
            return Response({"detail": "This lesson's knowledge check is not configured correctly."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if any(type(answer) is not int or answer < 0 or answer >= len(question["options"]) for answer, question in zip(answers, questions)):
            return Response({"answers": "Answers must be valid option indexes."}, status=status.HTTP_400_BAD_REQUEST)
        score = round(100 * sum(answer == question["correct_index"] for answer, question in zip(answers, questions)) / len(questions))

        with transaction.atomic():
            progress, _ = LessonProgress.objects.select_for_update().get_or_create(user=request.user, lesson=lesson)
            progress.attempts += 1
            progress.score = max(progress.score, score)
            newly_completed = score >= 70 and not progress.completed
            if newly_completed:
                progress.completed = True
                progress.completed_at = timezone.now()
            progress.save()
            points_awarded = POINTS_PER_LESSON if newly_completed else 0
            if newly_completed:
                points, _ = UserPoints.objects.select_for_update().get_or_create(user=request.user)
                points.total_points += points_awarded
                points.save(update_fields=["total_points", "updated_at"])
                today = timezone.localdate()
                profile = request.user.profile
                profile_fields = []
                if profile.last_activity_date != today:
                    profile.learning_streak = profile.learning_streak + 1 if profile.last_activity_date == today - timedelta(days=1) else 1
                    profile.last_activity_date = today
                    profile_fields.extend(["learning_streak", "last_activity_date"])
                total_lessons = Lesson.objects.filter(module__is_published=True).count()
                completed_lessons = LessonProgress.objects.filter(user=request.user, completed=True).count()
                if not profile.certificate_issued_at and total_lessons and completed_lessons >= total_lessons:
                    profile.certificate_issued_at = timezone.now()
                    profile_fields.append("certificate_issued_at")
                if profile_fields:
                    profile.save(update_fields=profile_fields)
                LearningActivity.objects.create(
                    user=request.user,
                    activity_type=LearningActivity.ActivityType.LESSON_COMPLETED,
                    description=f"Completed {lesson.title}",
                    points=points_awarded,
                    details={"lesson_id": lesson.id, "module_id": lesson.module_id, "score": score},
                )
            badges_earned = _award_eligible_achievements(request.user, lesson) if newly_completed else []

        return Response({
            "passed": score >= 70,
            "score": score,
            "completed": progress.completed,
            "points_awarded": points_awarded,
            "badges_earned": badges_earned,
            "attempts": progress.attempts,
            "feedback": [
                {"explanation": question.get("explanation", "")}
                for question in questions
            ],
        })


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        progress = LessonProgress.objects.filter(user=user, completed=True)
        total_lessons = Lesson.objects.filter(module__is_published=True).count()
        completed_count = progress.count()
        points = UserPoints.objects.filter(user=user).first()
        leaderboard_position = None
        if points and points.total_points:
            higher_scores = UserPoints.objects.filter(
                user__is_active=True,
                total_points__gt=points.total_points,
            ).count()
            tied_before = UserPoints.objects.filter(
                user__is_active=True,
                total_points=points.total_points,
            ).filter(
                Q(user__first_name__lt=user.first_name)
                | Q(user__first_name=user.first_name, user__username__lt=user.username)
            ).count()
            leaderboard_position = higher_scores + tied_before + 1
        recent = user.activities.all()[:8]
        activity_by_day = {
            entry["day"]: entry["points"] or 0
            for entry in user.activities.filter(created_at__date__gte=timezone.localdate() - timedelta(days=6))
            .values(day=F("created_at__date"))
            .annotate(points=Sum("points"))
        }
        days = [timezone.localdate() - timedelta(days=offset) for offset in range(6, -1, -1)]
        return Response({
            "points": points.total_points if points else 0,
            "level": (points.total_points // 100 + 1) if points else 1,
            "completed_lessons": completed_count,
            "total_lessons": total_lessons,
            "certificate_earned": bool(user.profile.certificate_issued_at),
            "certificate_issued_at": user.profile.certificate_issued_at,
            "streak": user.profile.learning_streak,
            "leaderboard_position": leaderboard_position,
            "achievements": [
                {"id": item.achievement_id, "slug": item.achievement.slug, "name": item.achievement.name, "description": item.achievement.description, "earned_at": item.earned_at}
                for item in user.achievements.select_related("achievement").all()
            ],
            "activity": [{"date": day, "points": activity_by_day.get(day, 0)} for day in days],
            "recent_activity": [
                {"id": item.id, "description": item.description, "points": item.points, "created_at": item.created_at}
                for item in recent
            ],
        })


class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        entries = UserPoints.objects.filter(user__is_active=True, total_points__gt=0).select_related("user").annotate(
            completed_lessons=Count("user__lesson_progress", filter=Q(user__lesson_progress__completed=True))
        ).order_by("-total_points", "user__first_name", "user__username")[:50]
        return Response([
            {
                "first_name": entry.user.first_name,
                "points": entry.total_points,
                "completed_lessons": entry.completed_lessons,
            }
            for entry in entries
        ])


class OverviewView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        published_modules = LearningModule.objects.filter(is_published=True).prefetch_related("lessons")
        lessons = [lesson for module in published_modules for lesson in module.lessons.all()]
        return Response({
            "modules": published_modules.count(),
            "lessons": len(lessons),
            "knowledge_checks": sum(len(lesson.knowledge_check) for lesson in lessons),
            "points_per_lesson": POINTS_PER_LESSON,
        })


class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        learners = User.objects.filter(is_staff=False)
        return Response({
            "students": learners.count(),
            "active_students": learners.filter(is_active=True).count(),
            "inactive_students": learners.filter(is_active=False).count(),
            "modules": LearningModule.objects.filter(is_published=True).count(),
            "lessons": Lesson.objects.filter(module__is_published=True).count(),
            "completions": LessonProgress.objects.filter(completed=True, user__is_staff=False).count(),
            "points_awarded": UserPoints.objects.filter(user__is_staff=False).aggregate(total=Sum("total_points"))["total"] or 0,
            "module_progress": list(
                LessonProgress.objects.filter(
                    completed=True,
                    user__is_staff=False,
                    lesson__module__is_published=True,
                )
                .values("lesson__module__title")
                .annotate(completions=Count("id"))
                .order_by("-completions", "lesson__module__title")
                .values("lesson__module__title", "completions")
            ),
        })


class AdminStudentListView(generics.ListAPIView):
    serializer_class = AdminStudentSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.filter(is_staff=False).annotate(
        points=Coalesce(F("points_record__total_points"), Value(0)),
        completed_lessons=Count("lesson_progress", filter=Q(lesson_progress__completed=True), distinct=True),
        learning_streak=F("profile__learning_streak"),
        last_activity_date=F("profile__last_activity_date"),
    ).order_by("-points", "username")


class AdminStudentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, user_id):
        student = get_object_or_404(User, id=user_id, is_staff=False)
        if student == request.user:
            return Response({"detail": "You cannot deactivate your own account here."}, status=status.HTTP_400_BAD_REQUEST)
        is_active = request.data.get("is_active")
        if not isinstance(is_active, bool):
            return Response({"is_active": "Expected a boolean value."}, status=status.HTTP_400_BAD_REQUEST)
        student.is_active = is_active
        student.save(update_fields=["is_active"])
        student_with_stats = User.objects.filter(is_staff=False).annotate(
            points=Coalesce(F("points_record__total_points"), Value(0)),
            completed_lessons=Count("lesson_progress", filter=Q(lesson_progress__completed=True), distinct=True),
            learning_streak=F("profile__learning_streak"),
            last_activity_date=F("profile__last_activity_date"),
        ).get(id=user_id)
        return Response(AdminStudentSerializer(student_with_stats).data)
