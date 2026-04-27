# 🎬 Video Platform — РГЗ по Интернет-технологиям

> Тестовая видеоплатформа: Python (Django REST) бэкенд + React JS фронтенд

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2-green)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://postgresql.org)

## 📋 Описание проекта

Функциональная веб-платформа для потокового видео, где пользователи могут просматривать, загружать и управлять видеоконтентом. Проект реализован в рамках РГЗ по теме «Создание тестовой видеоплатформы».

## 🗂 Структура репозитория

```
video-platform-rgz/
├── backend/          # Django REST API
│   ├── apps/
│   │   ├── users/    # Регистрация, авторизация, JWT
│   │   └── videos/   # Загрузка, стриминг, метаданные
│   ├── config/       # Настройки Django
│   ├── requirements.txt
│   └── manage.py
├── frontend/         # React JS приложение
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.jsx
│   └── package.json
├── docs/             # Документация API
│   ├── API.md
│   └── REPORT.md
├── docker-compose.yml
└── README.md
```

## ⚙️ Установка и запуск

### Требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (опционально)

### Запуск через Docker Compose

```bash
git clone https://github.com/XlebDaMaslo/video-platform-rgz.git
cd video-platform-rgz
cp backend/.env.example backend/.env
docker-compose up --build
```

После запуска:
- **API**: http://localhost:8000/api/
- **Frontend**: http://localhost:3000/
- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/

### Ручной запуск

#### Бэкенд
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # заполните переменные
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Фронтенд
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Переменные окружения

Создайте файл `backend/.env` (пример в `backend/.env.example`):

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/videoplatform
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
MEDIA_ROOT=./media
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

## 📖 Документация API

Полная документация API — [docs/API.md](docs/API.md)

Отчёт по проекту — [docs/REPORT.md](docs/REPORT.md)

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
python manage.py test

# Frontend тесты
cd frontend
npm test
```

## 👤 Автор

Nikita — [@XlebDaMaslo](https://github.com/XlebDaMaslo)
