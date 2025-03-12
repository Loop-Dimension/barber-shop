---

# 1. Project Overview

This project is a **Barber Queue Management System** built with **Django** (Python 3.x) and **PostgreSQL** as the database. It provides functionality for:

- **Authentication** (signup, login, token-based auth)
- **Barbers** management (CRUD)
- **Appointments** (create, update, cancel, complete, etc.)
- **Queue** system for walk-in customers
- **Services** (CRUD)

---

# 2. How to Run the Project

Below are step-by-step instructions on how to clone, set up, and run the Django project locally.

## 2.1. Prerequisites

- **Python 3.x** installed
- **PostgreSQL** installed and running
- **Git** (optional, if you plan to clone from a repository)
- **Pip** (usually comes with Python)

## 2.2. Clone or Download the Project

```bash
# Using Git (example)
git clone
cd barberqueue
```

If you don’t have Git, you can **download the ZIP** from the repository, unzip it, and navigate into the folder.

## 2.3. Create a Virtual Environment (Recommended)

```bash
# On Linux/Mac:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

## 2.4. Install Requirements

Inside your project directory (and with the virtual environment activated), run:

```bash
pip install -r requirements.txt
```

> If you don’t have a `requirements.txt` file, you can manually install:
>
> ```bash
> pip install django djangorestframework psycopg2-binary djangorestframework-simplejwt django-cors-headers
> ```

## 2.5. Configure Database Settings

Open `barberqueue/settings.py` and ensure the `DATABASES` section matches your PostgreSQL credentials. For example:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'barberqueue_db',
        'USER': 'postgres',
        'PASSWORD': 'your_pg_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 2.6. Run Migrations

Create the necessary tables and relationships in PostgreSQL:

```bash
python manage.py makemigrations
python manage.py migrate
```

## 2.7. Create a Superuser (Optional)

If you want to access Django’s admin panel, create a superuser:

```bash
python manage.py createsuperuser
```

Follow the prompts to set a username and password.

## 2.8. Run the Server

Finally, start the Django development server:

```bash
python manage.py runserver
```

By default, it runs on `http://127.0.0.1:8000/`. If you open this in your browser, you should see the Django welcome page or your custom homepage.

---
