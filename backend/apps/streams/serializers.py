from rest_framework import serializers
from .models import Stream


class StreamSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    hls_url = serializers.SerializerMethodField()
    rtmp_url = serializers.SerializerMethodField()

    class Meta:
        model = Stream
        fields = [
            'id', 'owner', 'owner_username',
            'title', 'description',
            'stream_key', 'is_live',
            'started_at', 'ended_at',
            'viewers_count', 'created_at',
            'hls_url', 'rtmp_url',
        ]
        read_only_fields = [
            'id', 'owner', 'stream_key', 'is_live',
            'started_at', 'ended_at', 'viewers_count', 'created_at',
        ]

    def get_hls_url(self, obj):
        return obj.hls_url

    def get_rtmp_url(self, obj):
        # Ключ RTMP показываем только владельцу
        request = self.context.get('request')
        if request and request.user == obj.owner:
            return obj.rtmp_url
        return None


class StreamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stream
        fields = ['title', 'description']
