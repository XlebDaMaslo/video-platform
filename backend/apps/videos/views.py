from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from .models import Video, Category, Comment
from .serializers import (
    VideoListSerializer, VideoDetailSerializer,
    VideoUploadSerializer, CategorySerializer, CommentSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class VideoListCreateView(generics.ListCreateAPIView):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'owner__username']
    ordering_fields = ['created_at', 'views_count', 'duration']
    ordering = ['-created_at']

    def get_queryset(self):
        # Для учебного проекта показываем все видео (READY + PROCESSING)
        qs = Video.objects.exclude(status=Video.Status.FAILED).select_related('owner', 'category')
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VideoUploadSerializer
        return VideoListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Сразу ставим READY — в учебном проекте нет асинхронной обработки видео
        serializer.save(owner=self.request.user, status=Video.Status.READY)

    @extend_schema(tags=['videos'])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Video.objects.select_related('owner', 'category').prefetch_related('comments__author')
    permission_classes = [IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return VideoUploadSerializer
        return VideoDetailSerializer

    @extend_schema(tags=['videos'])
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class StreamVideoView(APIView):
    """
    GET /api/videos/<id>/stream/
    Возвращает относительный URL медиафайла (/media/videos/...).
    Не использует build_absolute_uri — внутри Docker хост был бы «backend»,
    браузер его не резолвит. Vite proxy проксирует /media/ на backend:8000.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(tags=['videos'])
    def get(self, request, pk):
        # Показываем любое видео кроме ошибочных
        video = get_object_or_404(Video.objects.exclude(status=Video.Status.FAILED), pk=pk)
        if not video.file:
            return Response({'error': 'No file attached'}, status=status.HTTP_404_NOT_FOUND)
        # Относительный URL: /media/videos/2026/04/file.mp4
        return Response({'stream_url': video.file.url})


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(video_id=self.kwargs['pk']).select_related('author')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        video = get_object_or_404(Video, pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, video=video)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
