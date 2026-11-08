from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from awareness.views import (
    AdminAnalyticsView,
    AdminStudentDetailView,
    AdminStudentListView,
    CategoryViewSet,
    DashboardView,
    LeaderboardView,
    LessonCompletionView,
    ModuleViewSet,
    OverviewView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    TokenObtainPairViewWithThrottle,
    ProfileView,
    RegisterView,
    SetupAdminView,
)

router = DefaultRouter()
router.register("modules", ModuleViewSet, basename="module")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/setup-admin/", SetupAdminView.as_view(), name="setup-admin"),
    path("api/auth/token/", TokenObtainPairViewWithThrottle.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/profile/", ProfileView.as_view(), name="profile"),
    path("api/auth/password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("api/auth/password-reset/<str:uid>/<str:token>/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("api/dashboard/", DashboardView.as_view(), name="dashboard"),
    path("api/leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
    path("api/overview/", OverviewView.as_view(), name="overview"),
    path("api/lessons/<int:lesson_id>/complete/", LessonCompletionView.as_view(), name="lesson-complete"),
    path("api/admin/analytics/", AdminAnalyticsView.as_view(), name="admin-analytics"),
    path("api/admin/students/", AdminStudentListView.as_view(), name="admin-students"),
    path("api/admin/students/<int:user_id>/", AdminStudentDetailView.as_view(), name="admin-student-detail"),
    path("api/", include(router.urls)),
]
