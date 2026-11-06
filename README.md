# DIGITAL_Awareness - DigiAware

**Think Before You Click.** DigiAware is an interactive digital-awareness platform for practicing safer decisions around phishing, payments, privacy, social media, identity, and everyday browsing.

## What is included

- Responsive React, Vite, Tailwind CSS, Framer Motion-ready design system, and Lucide iconography.
- Django REST API with JWT login/refresh, password validation, role-aware permissions, and a custom user model.
- Interactive learning missions with real-world scenarios, clue hunting, field guides, and server-graded knowledge checks.
- Automatic next-module progression upon passing challenges with countdown controls and retry support for failed attempts.
- Gamified engagement with activity-based points, daily streaks, automated badge unlocking, and a privacy-preserving leaderboard.
- Staff admin portal featuring platform-wide analytics, curriculum engagement charts, module and category management, and student account administration.
- PostgreSQL support through `DATABASE_URL`; SQLite is the zero-setup development default.

## Requirements

- Node.js 20.19+ or 22.12+ and npm.
- Python 3.12+ and pip.
- PostgreSQL 14+ for a shared/production database (optional for local development).

## Local setup

From the project root, create a local environment file and generate a private Django key:

```powershell
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Paste the generated value into `DJANGO_SECRET_KEY` in `.env`. Keep `.env` private; it is intentionally excluded from source control.

Install and start the API:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python backend\manage.py makemigrations awareness
python backend\manage.py migrate
python backend\manage.py seed_content
python backend\manage.py createsuperuser
python backend\manage.py runserver
```

The local API is at `http://127.0.0.1:8000/api/` and Django administration is at `http://127.0.0.1:8000/admin/`. `createsuperuser` makes an administrator; public registration always creates a learner account.

In development, password-reset links are written to the Django console (`DJANGO_EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend`). Configure the `EMAIL_*` variables in `.env` and use an SMTP provider for delivery outside local development.

In another terminal, install and start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Set `VITE_API_URL` in the root `.env` when the API is hosted somewhere other than `http://127.0.0.1:8000/api`. Restart Vite after changing environment values.

## Verification

Run Django system checks, migration consistency checks, backend unit and API tests, and the frontend production build:

```powershell
# Backend checks and test suite
python backend\manage.py check
python backend\manage.py makemigrations --check --dry-run
python backend\manage.py test awareness

# Frontend production build
cd frontend
npm run build
```

## Production and external deployment requirements

The application code is deployment-ready, but external cloud and hosting services must be provisioned independently:

1. **PostgreSQL Database**:
   - Provision a PostgreSQL 14+ instance.
   - Set `DATABASE_URL=postgresql://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>` in the deployment environment.
   - Run `python backend\manage.py migrate` against the database.
2. **Environment & Security**:
   - Set `DJANGO_DEBUG=false`.
   - Provide a unique, high-entropy `DJANGO_SECRET_KEY` via a deployment secret manager.
   - Set `DJANGO_ALLOWED_HOSTS` to your production domain(s).
   - Set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to your frontend production domain(s).
   - Once HTTPS is active, enable `DJANGO_SECURE_SSL_REDIRECT=true` and `DJANGO_SECURE_HSTS_SECONDS=31536000`.
3. **Static Assets**:
   - Collect Django admin and WhiteNoise assets:
     ```powershell
     python backend\manage.py collectstatic --noinput
     ```
   - Deploy the static frontend bundle from `frontend/dist/` to your static web host or CDN.
4. **Email Delivery (SMTP)**:
   - Configure a real SMTP service (e.g. SendGrid, Mailgun, AWS SES, or institutional SMTP).
   - Set `DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`.
   - Provide `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS=true`, and `DEFAULT_FROM_EMAIL`.

> Local development uses SQLite and console email delivery by default. External services (PostgreSQL server, production SMTP, external hosting) were not provisioned in this environment and require actual service credentials.

## Learning and rewards

Learners register, sign in, and open a published module. Knowledge-check answers are graded by the API; a passing score of 70% (at least 4 out of 5 correct) completes a lesson and awards 20 points once. A failed attempt can be retried without losing progress. Streaks update when a learner completes their first lesson on a new day. Badges are awarded from completed lessons, and the leaderboard uses persisted earned points without exposing usernames or account IDs. Completing every currently published lesson unlocks a personalized certificate that can be printed or saved as PDF. The curriculum can be safely seeded again without creating duplicate starter content:

```powershell
python backend\manage.py seed_content
```

## API overview

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /api/auth/register/` | Public | Register a learner account |
| `POST /api/auth/token/` | Public | Obtain JWT access and refresh tokens |
| `POST /api/auth/token/refresh/` | Public | Refresh an access token |
| `POST /api/auth/password-reset/` | Public, rate-limited | Request a password reset email |
| `POST /api/auth/password-reset/{uid}/{token}/` | Public | Set a new password from a valid reset link |
| `GET/PATCH /api/auth/profile/` | Authenticated | Read or update the current profile |
| `GET /api/overview/` | Public | Read current published curriculum statistics |
| `GET /api/modules/` | Public | Browse published modules (hides unpublished modules & quiz answers) |
| `GET /api/modules/{slug}/` | Public | Read a published module and its lessons |
| `GET/POST /api/categories/` | Staff | List and create learning categories |
| `PATCH/DELETE /api/categories/{id}/` | Staff | Update or delete learning categories (protects categories with modules) |
| `POST /api/lessons/{id}/complete/` | Authenticated | Submit answers and record a lesson result |
| `GET /api/dashboard/` | Authenticated | Read personal learning progress, streaks, badges, and recent activity |
| `GET /api/leaderboard/` | Public | View earned points and completed lessons (privacy-safe: no usernames or emails) |
| `GET /api/admin/analytics/` | Staff | View platform statistics, learner counts, and module completion rates |
| `GET /api/admin/students/` | Staff | List learner accounts with points, completed lessons, and streaks |
| `PATCH /api/admin/students/{id}/` | Staff | Activate or suspend a learner account |

Use `/admin/` for Django's permission-protected management of users, categories, modules, lessons, and learning records.
