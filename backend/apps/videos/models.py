from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

    def __str__(self):
        return self.name


class Video(models.Model):
    class Status(models.TextChoices):
        PROCESSING = 'processing', 'Обрабатывается'
        READY = 'ready', 'Готово'
        FAILED = 'failed', 'Ошибка'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='videos/%Y/%m/')
    thumbnail = models.ImageField(upload_to='thumbnails/%Y/%m/', null=True, blank=True)
    duration = models.PositiveIntegerField(default=0, help_text='Длительность в секундах')
    views_count = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PROCESSING
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='videos',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='videos',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Видео'
        verbose_name_plural = 'Видео'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def increment_views(self):
        """Атомарно увеличивает счётчик просмотров."""
        Video.objects.filter(pk=self.pk).update(
            views_count=models.F('views_count') + 1
        )


class Comment(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments'
    )
    text = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['-created_at']

    def __str__(self):
        return f'Комментарий {self.author} к "{self.video}"'
