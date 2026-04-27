from rest_framework import serializers
from .models import Video, Category, Comment
from apps.users.serializers import UserProfileSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')


class CommentSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'author', 'text', 'created_at')
        read_only_fields = ('id', 'author', 'created_at')


class VideoListSerializer(serializers.ModelSerializer):
    owner = UserProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Video
        fields = (
            'id', 'title', 'description', 'thumbnail',
            'duration', 'views_count', 'status',
            'owner', 'category', 'created_at',
        )


class VideoDetailSerializer(VideoListSerializer):
    comments = CommentSerializer(many=True, read_only=True)

    class Meta(VideoListSerializer.Meta):
        fields = VideoListSerializer.Meta.fields + ('file', 'comments')


class VideoUploadSerializer(serializers.ModelSerializer):
    """Serializer для загрузки видео.
    Возвращает id в ответе 201 — фронтенд делает navigate('/video/<id>').
    """
    class Meta:
        model = Video
        # id read_only by default — включаем в ответ чтобы navigate работал
        fields = ('id', 'title', 'description', 'file', 'thumbnail', 'category')
        read_only_fields = ('id',)

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
