from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        LEARNER = "learner", "Learner"
        ADMIN = "admin", "Administrator"

    role = models.CharField(max_length=16, choices=Role.choices, default=Role.LEARNER)

    def save(self, *args, **kwargs):
        if self.is_staff or self.is_superuser:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    college = models.CharField(max_length=160, blank=True)
    learning_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    certificate_issued_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


class LearningCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True)
    description = models.CharField(max_length=240, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class LearningModule(models.Model):
    class Difficulty(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    category = models.ForeignKey(LearningCategory, on_delete=models.PROTECT, related_name="modules")
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    difficulty = models.CharField(max_length=16, choices=Difficulty.choices, default=Difficulty.BEGINNER)
    estimated_minutes = models.PositiveSmallIntegerField(default=10)
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_modules")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category__name", "title"]

    def __str__(self):
        return self.title


class Lesson(models.Model):
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=180)
    content = models.TextField()
    position = models.PositiveSmallIntegerField()
    knowledge_check = models.JSONField(default=list)

    class Meta:
        ordering = ["position"]
        constraints = [
            models.UniqueConstraint(fields=["module", "position"], name="unique_lesson_position_per_module"),
        ]

    def __str__(self):
        return f"{self.module.title}: {self.title}"


class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress")
    completed = models.BooleanField(default=False)
    score = models.PositiveSmallIntegerField(default=0)
    attempts = models.PositiveSmallIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "lesson"], name="unique_user_lesson_progress"),
            models.CheckConstraint(condition=models.Q(score__lte=100), name="lesson_score_at_most_100"),
        ]


class UserPoints(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="points_record")
    total_points = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.CheckConstraint(condition=models.Q(total_points__gte=0), name="user_points_non_negative")]


class Achievement(models.Model):
    slug = models.SlugField(max_length=80, unique=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=240)
    icon = models.CharField(max_length=40, default="shield")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="achievements")
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name="earners")
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "achievement"], name="unique_user_achievement"),
        ]
        ordering = ["-earned_at"]


class LearningActivity(models.Model):
    class ActivityType(models.TextChoices):
        LESSON_COMPLETED = "lesson_completed", "Lesson completed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activities")
    activity_type = models.CharField(max_length=32, choices=ActivityType.choices)
    description = models.CharField(max_length=240)
    points = models.PositiveSmallIntegerField(default=0)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-created_at"]
