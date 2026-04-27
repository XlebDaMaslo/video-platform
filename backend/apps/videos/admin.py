from django.contrib import admin
from .models import Video, Category, Comment


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'status', 'views_count', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'owner__email')
    readonly_fields = ('views_count', 'created_at', 'updated_at')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'video', 'created_at')
    search_fields = ('author__email', 'video__title')
