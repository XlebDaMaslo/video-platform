from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseForbidden
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Stream
from .serializers import StreamSerializer, StreamCreateSerializer


class StreamListView(generics.ListAPIView):
    """GET /api/streams/ — список активных трансляций (публично)."""
    serializer_class = StreamSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Stream.objects.select_related('owner')
        live_only = self.request.query_params.get('live')
        if live_only == '1':
            qs = qs.filter(is_live=True)
        return qs


class StreamCreateView(generics.CreateAPIView):
    """POST /api/streams/create/ — создать трансляцию (требует авторизации)."""
    serializer_class = StreamCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Возвращаем полный объект включая ключ
        full = StreamSerializer(serializer.instance, context={'request': request})
        return Response(full.data, status=status.HTTP_201_CREATED)


class StreamDetailView(generics.RetrieveAPIView):
    """GET /api/streams/<id>/ — детали трансляции."""
    queryset = Stream.objects.select_related('owner')
    serializer_class = StreamSerializer
    permission_classes = [permissions.AllowAny]


class StreamDeleteView(generics.DestroyAPIView):
    """DELETE /api/streams/<id>/delete/ — удалить трансляцию."""
    queryset = Stream.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Stream.objects.filter(owner=self.request.user)


class RegenerateKeyView(APIView):
    """POST /api/streams/<id>/regenerate-key/ — сгенерировать новый ключ."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            stream = Stream.objects.get(pk=pk, owner=request.user)
        except Stream.DoesNotExist:
            return Response({'detail': 'Не найдено.'}, status=status.HTTP_404_NOT_FOUND)
        import uuid
        stream.stream_key = uuid.uuid4()
        stream.save(update_fields=['stream_key'])
        serializer = StreamSerializer(stream, context={'request': request})
        return Response(serializer.data)


# ─── Webhook-endpoints для nginx-rtmp ────────────────────────────────────────

@csrf_exempt
def stream_auth(request):
    """
    nginx-rtmp вызывает этот endpoint при on_publish.
    POST-поле 'name' содержит stream_key.
    Возвращаем 200 (разрешить) или 403 (отклонить).
    """
    if request.method != 'POST':
        return HttpResponseForbidden()

    stream_key = request.POST.get('name', '')
    try:
        stream = Stream.objects.get(stream_key=stream_key)
        stream.is_live = True
        stream.started_at = timezone.now()
        stream.ended_at = None
        stream.save(update_fields=['is_live', 'started_at', 'ended_at'])
        return HttpResponse(status=200)
    except Stream.DoesNotExist:
        return HttpResponseForbidden('Неверный ключ стрима')


@csrf_exempt
def stream_done(request):
    """
    nginx-rtmp вызывает этот endpoint при on_publish_done.
    Помечаем стрим как завершённый.
    """
    if request.method != 'POST':
        return HttpResponseForbidden()

    stream_key = request.POST.get('name', '')
    Stream.objects.filter(stream_key=stream_key).update(
        is_live=False,
        ended_at=timezone.now(),
    )
    return HttpResponse(status=200)
