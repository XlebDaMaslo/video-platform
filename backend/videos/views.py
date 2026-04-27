from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Video, Category, Comment
from .serializers import VideoSerializer, VideoListSerializer, CategorySerializer, CommentSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    # Disable pagination for categories — small finite list, no need
    pagination_class = None


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().select_related('author', 'category').order_by('-created_at')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'views_count']
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return VideoListSerializer
        return VideoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'stream']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def stream(self, request, pk=None):
        video = self.get_object()
        if not video.file:
            return Response({'error': 'No file'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'url': request.build_absolute_uri(video.file.url)})

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comments(self, request, pk=None):
        video = self.get_object()
        if request.method == 'GET':
            qs = Comment.objects.filter(video=video).select_related('author').order_by('created_at')
            return Response(CommentSerializer(qs, many=True).data)
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(author=request.user, video=video)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
