import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Stream',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Название')),
                ('description', models.TextField(blank=True, verbose_name='Описание')),
                ('stream_key', models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name='Ключ стрима')),
                ('is_live', models.BooleanField(default=False, verbose_name='В эфире')),
                ('started_at', models.DateTimeField(blank=True, null=True, verbose_name='Начало')),
                ('ended_at', models.DateTimeField(blank=True, null=True, verbose_name='Конец')),
                ('viewers_count', models.PositiveIntegerField(default=0, verbose_name='Зрители')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='streams',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Стример',
                )),
            ],
            options={
                'verbose_name': 'Трансляция',
                'verbose_name_plural': 'Трансляции',
                'ordering': ['-created_at'],
            },
        ),
    ]
