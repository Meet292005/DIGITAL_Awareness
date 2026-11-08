import os
from django.core.management.base import BaseCommand
from awareness.models import User


class Command(BaseCommand):
    help = "Creates a default admin user if one does not already exist."

    def handle(self, *args, **options):
        admin_user = os.environ.get("ADMIN_USERNAME", "admin")
        admin_pass = os.environ.get("ADMIN_PASSWORD", "Admin@123456")
        admin_mail = os.environ.get("ADMIN_EMAIL", "admin@digiaware.local")

        if not User.objects.filter(username=admin_user).exists():
            u = User.objects.create(
                username=admin_user,
                email=admin_mail,
                role=User.Role.ADMIN,
                is_staff=True,
                is_superuser=True,
            )
            u.set_password(admin_pass)
            u.save()
            self.stdout.write(self.style.SUCCESS(f"Default admin user '{admin_user}' created successfully."))
        else:
            self.stdout.write(f"Admin user '{admin_user}' already exists.")
