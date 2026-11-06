from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import (
    Achievement,
    LearningCategory,
    LearningModule,
    Lesson,
    LessonProgress,
    User,
    UserAchievement,
)


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password], min_length=8)
    college = serializers.CharField(required=False, allow_blank=True, max_length=160, write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "password", "college"]

    def create(self, validated_data):
        college = validated_data.pop("college", "")
        user = User.objects.create_user(**validated_data)
        user.profile.college = college
        user.profile.save(update_fields=["college"])
        return user


class ProfileSerializer(serializers.ModelSerializer):
    college = serializers.CharField(source="profile.college", required=False, allow_blank=True, max_length=160)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "is_staff", "college"]
        read_only_fields = ["id", "username", "role", "is_staff"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        instance = super().update(instance, validated_data)
        if "college" in profile_data:
            instance.profile.college = profile_data["college"]
            instance.profile.save(update_fields=["college"])
        return instance


class AdminStudentSerializer(serializers.ModelSerializer):
    points = serializers.IntegerField(read_only=True)
    completed_lessons = serializers.IntegerField(read_only=True)
    learning_streak = serializers.IntegerField(read_only=True)
    last_activity_date = serializers.DateField(read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "is_active", "date_joined",
            "points", "completed_lessons", "learning_streak", "last_activity_date",
        ]
        read_only_fields = fields


class LearningCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningCategory
        fields = ["id", "name", "slug", "description"]


class LessonSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "content", "position", "questions"]

    def get_questions(self, lesson):
        return [
            {"prompt": question["prompt"], "options": question["options"], "hint": question.get("explanation", "")}
            for question in lesson.knowledge_check
        ]


class LearningModuleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = LearningModule
        fields = [
            "id", "category", "category_name", "title", "slug", "description",
            "difficulty", "estimated_minutes", "is_published", "lessons",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "slug", "name", "description", "icon", "earned_at"]


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)
    module_title = serializers.CharField(source="lesson.module.title", read_only=True)

    class Meta:
        model = LessonProgress
        fields = ["id", "lesson_title", "module_title", "completed", "score", "completed_at"]
