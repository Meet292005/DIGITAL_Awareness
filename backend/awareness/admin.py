from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import (
    Achievement,
    LearningActivity,
    LearningCategory,
    LearningModule,
    Lesson,
    LessonProgress,
    User,
    UserAchievement,
    UserPoints,
    UserProfile,
)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (("DigiAware", {"fields": ("role",)}),)
    list_display = ("username", "email", "first_name", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")


admin.site.register(UserProfile)
admin.site.register(LearningCategory)
admin.site.register(LearningModule)
admin.site.register(Lesson)
admin.site.register(LessonProgress)
admin.site.register(UserPoints)
admin.site.register(Achievement)
admin.site.register(UserAchievement)
admin.site.register(LearningActivity)
