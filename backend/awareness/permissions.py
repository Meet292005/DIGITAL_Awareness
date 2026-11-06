from rest_framework.permissions import BasePermission, SAFE_METHODS


class PublishedReadOnlyOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return obj.is_published or bool(request.user and request.user.is_staff)
        return bool(request.user and request.user.is_staff)
