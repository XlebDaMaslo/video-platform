import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='name')),
                ('slug', models.SlugField(max_length=100, unique=True)),
            ],
            options={
                'verbose_name': 'category',
                'verbose_name_plural': 'categories',
                'db_table': 'videos_category',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='title')),
                ('description', models.TextField(blank=True, verbose_name='description')),
                ('file', models.FileField(upload_to='videos/%Y/%m/', verbose_name='video file')),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='thumbnails/%Y/%m/', verbose_name='thumbnail')),
                ('duration', models.PositiveIntegerField(default=0, verbose_name='duration')),
                ('views_count', models.PositiveIntegerField(default=0, verbose_name='views')),
                ('status', models.CharField(
                    choices=[
                        ('processing', '\u041e\u0431\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f'),
                        ('ready', '\u0413\u043e\u0442\u043e\u0432\u043e'),
                        ('failed', '\u041e\u0448\u0438\u0431\u043a\u0430'),
                    ],
                    default='processing',
                    max_length=20,
                    verbose_name='status',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='videos',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='owner',
                )),
                ('category', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='videos',
                    to='videos.category',
                    verbose_name='category',
                )),
            ],
            options={
                'verbose_name': 'video',
                'verbose_name_plural': 'videos',
                'db_table': 'videos_video',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField(max_length=2000, verbose_name='text')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='comments',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='author',
                )),
                ('video', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='comments',
                    to='videos.video',
                    verbose_name='video',
                )),
            ],
            options={
                'verbose_name': 'comment',
                'verbose_name_plural': 'comments',
                'db_table': 'videos_comment',
                'ordering': ['-created_at'],
            },
        ),
    ]
