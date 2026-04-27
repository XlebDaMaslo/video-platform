# API документация

## Базовый URL

```text
http://localhost:8000/api/
```

## Аутентификация

Для защищённых эндпоинтов используется JWT Bearer Token.

Заголовок:

```http
Authorization: Bearer <access_token>
```

---

## Эндпоинты пользователей

### 1. Регистрация

**POST** `/users/register/`

Создаёт нового пользователя и возвращает пару JWT токенов.

#### Тело запроса

```json
{
  "username": "nikita",
  "email": "nikita@example.com",
  "password": "StrongPass123!",
  "password2": "StrongPass123!"
}
```

#### Ответ 201 Created

```json
{
  "user": {
    "id": 1,
    "username": "nikita",
    "email": "nikita@example.com",
    "avatar": null,
    "bio": "",
    "created_at": "2026-04-26T12:00:00Z"
  },
  "tokens": {
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>"
  }
}
```

#### Пример cURL

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nikita",
    "email": "nikita@example.com",
    "password": "StrongPass123!",
    "password2": "StrongPass123!"
  }'
```

---

### 2. Вход

**POST** `/users/login/`

#### Тело запроса

```json
{
  "email": "nikita@example.com",
  "password": "StrongPass123!"
}
```

#### Ответ 200 OK

```json
{
  "refresh": "<jwt_refresh_token>",
  "access": "<jwt_access_token>"
}
```

#### Пример cURL

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nikita@example.com",
    "password": "StrongPass123!"
  }'
```

---

### 3. Обновление access-токена

**POST** `/users/token/refresh/`

```json
{
  "refresh": "<jwt_refresh_token>"
}
```

---

### 4. Профиль пользователя

**GET** `/users/profile/`

Возвращает профиль текущего пользователя.

#### Пример cURL

```bash
curl http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer <access_token>"
```

**PATCH** `/users/profile/`

Позволяет изменить `bio` и `avatar`.

---

## Эндпоинты видео

### 5. Получить список видео

**GET** `/videos/`

Публичный список видео со статусом `ready`.

#### Query-параметры

- `search` — поиск по названию, описанию и имени автора
- `category` — фильтр по slug категории
- `ordering` — сортировка: `created_at`, `views_count`, `duration`
- `page` — номер страницы пагинации

#### Пример cURL

```bash
curl "http://localhost:8000/api/videos/?search=python&ordering=-created_at&page=1"
```

#### Пример ответа

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 10,
      "title": "Введение в Django",
      "description": "Краткий обзор Django REST Framework",
      "thumbnail": "/media/thumbnails/2026/04/thumb.jpg",
      "duration": 450,
      "views_count": 27,
      "status": "ready",
      "owner": {
        "id": 1,
        "username": "nikita",
        "email": "nikita@example.com",
        "avatar": null,
        "bio": "",
        "created_at": "2026-04-26T12:00:00Z"
      },
      "category": {
        "id": 2,
        "name": "Programming",
        "slug": "programming"
      },
      "created_at": "2026-04-26T13:00:00Z"
    }
  ]
}
```

---

### 6. Загрузить видео

**POST** `/videos/`

Требует авторизацию. Отправляется как `multipart/form-data`.

#### Параметры формы

- `title` — обязательное поле
- `description` — текстовое описание
- `file` — видеофайл
- `thumbnail` — изображение-обложка
- `category` — ID категории

#### Пример cURL

```bash
curl -X POST http://localhost:8000/api/videos/ \
  -H "Authorization: Bearer <access_token>" \
  -F "title=Тестовое видео" \
  -F "description=Описание тестового видео" \
  -F "file=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumb.jpg" \
  -F "category=2"
```

#### Возможные ошибки

- `401 Unauthorized` — пользователь не авторизован
- `400 Bad Request` — невалидные данные формы
- `413 Payload Too Large` — файл превышает допустимый размер (если ограничение настроено)

---

### 7. Получить детали видео

**GET** `/videos/{id}/`

Возвращает полную информацию о видео, а также увеличивает счётчик просмотров.

#### Пример cURL

```bash
curl http://localhost:8000/api/videos/10/
```

---

### 8. Обновить видео

**PUT/PATCH** `/videos/{id}/`

Доступно только владельцу видео.

---

### 9. Удалить видео

**DELETE** `/videos/{id}/`

Доступно только владельцу видео.

#### Пример cURL

```bash
curl -X DELETE http://localhost:8000/api/videos/10/ \
  -H "Authorization: Bearer <access_token>"
```

---

### 10. Получить URL для стриминга

**GET** `/videos/{id}/stream/`

#### Ответ

```json
{
  "stream_url": "http://localhost:8000/media/videos/2026/04/video.mp4"
}
```

#### Пример cURL

```bash
curl http://localhost:8000/api/videos/10/stream/
```

---

### 11. Комментарии к видео

**GET** `/videos/{id}/comments/`

Публичный список комментариев.

**POST** `/videos/{id}/comments/`

Требует авторизацию.

#### Тело запроса

```json
{
  "text": "Отличное видео, спасибо!"
}
```

#### Пример cURL

```bash
curl -X POST http://localhost:8000/api/videos/10/comments/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Отличное видео, спасибо!"}'
```

---

### 12. Категории

**GET** `/videos/categories/`

Возвращает список категорий.

#### Пример ответа

```json
[
  {
    "id": 1,
    "name": "Education",
    "slug": "education"
  },
  {
    "id": 2,
    "name": "Programming",
    "slug": "programming"
  }
]
```

---

## Swagger / OpenAPI

После запуска проекта доступна автоматически генерируемая документация:

- Swagger UI: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`
- OpenAPI schema: `http://localhost:8000/api/schema/`

---

## Примечания по безопасности

- В production необходимо заменить `SECRET_KEY`.
- Следует ограничить допустимые расширения и MIME-типы загружаемых файлов.
- Для стриминга больших файлов рекомендуется использовать Nginx/X-Accel-Redirect или объектное хранилище.
- Для production-развёртывания рекомендуется вынести медиафайлы в S3-совместимое хранилище.
