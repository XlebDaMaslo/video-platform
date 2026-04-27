from django.contrib import admin
from .models import Stream


@admin.register(Stream)
class StreamAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'is_live', 'started_at', 'viewers_count')
    list_filter = ('is_live',)
    search_fields = ('title', 'owner__username')
    readonly_fields = ('stream_key', 'started_at', 'ended_at', 'viewers_count', 'created_at')
