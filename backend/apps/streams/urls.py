from django.urls import path
from . import views

urlpatterns = [
    # Публичные
    path('', views.StreamListView.as_view(), name='stream-list'),
    path('<int:pk>/', views.StreamDetailView.as_view(), name='stream-detail'),

    # Авторизованные действия
    path('create/', views.StreamCreateView.as_view(), name='stream-create'),
    path('<int:pk>/delete/', views.StreamDeleteView.as_view(), name='stream-delete'),
    path('<int:pk>/regenerate-key/', views.RegenerateKeyView.as_view(), name='stream-regen-key'),

    # Webhooks от nginx-rtmp (вызываются внутренней сетью Docker)
    path('auth/', views.stream_auth, name='stream-auth'),
    path('done/', views.stream_done, name='stream-done'),
]
