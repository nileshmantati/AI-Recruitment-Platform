import getpass
import os
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email
from django.db import transaction
from users.models import User
from admin_portal.models import AuditLog


class Command(BaseCommand):
    help = (
        "Securely provisions the initial Superadmin account for the platform. "
        "Supports interactive prompts, CLI arguments, or environment variables. "
        "Will never silently overwrite existing user roles or expose credentials."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help="Superadmin username. If omitted, will be prompted or read from DJANGO_SUPERADMIN_USERNAME."
        )
        parser.add_argument(
            '--email',
            type=str,
            help="Superadmin email address. If omitted, will be prompted or read from DJANGO_SUPERADMIN_EMAIL."
        )
        parser.add_argument(
            '--password',
            type=str,
            help="Superadmin password. If omitted, will be prompted securely or read from DJANGO_SUPERADMIN_PASSWORD."
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='',
            help="Optional first name."
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='',
            help="Optional last name."
        )
        parser.add_argument(
            '--no-input',
            action='store_true',
            help="Run in non-interactive mode. Requires arguments or environment variables to be provided."
        )

    def handle(self, *args, **options):
        no_input = options.get('no_input', False)

        username = (
            options.get('username') or
            os.environ.get('DJANGO_SUPERADMIN_USERNAME') or
            ''
        ).strip()

        email = (
            options.get('email') or
            os.environ.get('DJANGO_SUPERADMIN_EMAIL') or
            ''
        ).strip()

        password = (
            options.get('password') or
            os.environ.get('DJANGO_SUPERADMIN_PASSWORD') or
            ''
        )

        first_name = options.get('first_name', '').strip()
        last_name = options.get('last_name', '').strip()

        # Interactive prompts if required
        if not no_input:
            if not username:
                username = input("Superadmin username: ").strip()
            if not email:
                email = input("Superadmin email address: ").strip()
            if not password:
                while True:
                    p1 = getpass.getpass("Superadmin password: ")
                    p2 = getpass.getpass("Confirm password: ")
                    if p1 != p2:
                        self.stderr.write(self.style.ERROR("Error: Passwords do not match. Please try again."))
                        continue
                    if len(p1) < 8:
                        self.stderr.write(self.style.ERROR("Error: Password must be at least 8 characters long."))
                        continue
                    password = p1
                    break

        # Validate inputs
        if not username:
            raise CommandError("Superadmin username is required.")

        if not email:
            raise CommandError("Superadmin email is required.")

        try:
            validate_email(email)
        except ValidationError:
            raise CommandError(f"'{email}' is not a valid email address.")

        if not password or len(password) < 8:
            raise CommandError("Superadmin password must be at least 8 characters long.")

        with transaction.atomic():
            # Check existing username
            existing_user = User.objects.filter(username__iexact=username).first()
            if existing_user:
                if existing_user.is_superuser:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Superadmin account '{existing_user.username}' already exists. No changes made."
                        )
                    )
                    return
                else:
                    raise CommandError(
                        f"A non-superadmin user with username '{username}' already exists (role={existing_user.role}). "
                        "Cannot automatically promote an arbitrary user. "
                        "Choose a distinct administrative username."
                    )

            # Check existing email
            existing_email_user = User.objects.filter(email__iexact=email).first()
            if existing_email_user:
                if existing_email_user.is_superuser:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Superadmin account with email '{email}' already exists. No changes made."
                        )
                    )
                    return
                else:
                    raise CommandError(
                        f"User with email '{email}' already exists (role={existing_email_user.role}). "
                        "Cannot hijack existing accounts for Superadmin bootstrap."
                    )

            # Create Superadmin user
            super_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=User.Role.ADMIN,
                is_staff=True,
                is_superuser=True,
                is_email_verified=True,
                is_active=True
            )

            # Record bootstrap audit log (never logging password or sensitive values)
            AuditLog.objects.create(
                actor=super_user,
                action="SUPER_ADMIN_BOOTSTRAPPED",
                target_type="USER",
                target_id=str(super_user.id),
                target_repr=super_user.username,
                summary=f"Initial Superadmin account '{super_user.username}' was provisioned via management command.",
                metadata={
                    "username": super_user.username,
                    "email": super_user.email,
                    "is_superuser": True,
                    "is_staff": True,
                    "role": User.Role.ADMIN,
                    "provisioned_via": "bootstrap_superadmin"
                }
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully bootstrapped Superadmin account: '{super_user.username}' ({super_user.email})"
                )
            )
