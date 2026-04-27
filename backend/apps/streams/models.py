import uuid
from django.db import models
from django.conf import settings


class Stream(models.Model):
    """Модель прямой трансляции."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='streams',
        verbose_name='Стример',
    )
    title = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(blank=True, verbose_name='Описание')
    stream_key = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name='Ключ стрима',
    )
    is_live = models.BooleanField(default=False, verbose_name='В эфире')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Начало')
    ended_at = models.DateTimeField(null=True, blank=True, verbose_name='Конец')
    viewers_count = models.PositiveIntegerField(default=0, verbose_name='Зрители')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Трансляция'
        verbose_name_plural = 'Трансляции'
        ordering = ['-created_at']

    def __str__(self):
        status = '🔴 LIVE' if self.is_live else '⚫ Офлайн'
        return f'{status} | {self.title} ({self.owner})'

    @property
    def hls_url(self):
        """URL плейлиста HLS для воспроизведения в браузере."""
        return f'http://localhost:8080/hls/{self.stream_key}.m3u8'

    @property
    def rtmp_url(self):
        """RTMP-адрес для OBS / FFmpeg."""
        return f'rtmp://localhost/live/{self.stream_key}'
