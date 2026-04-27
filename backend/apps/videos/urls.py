from django.urls import path
from .views import (
    VideoListCreateView,
    VideoDetailView,
    StreamVideoView,
    CommentListCreateView,
    CategoryListView,
)

urlpatterns = [
    path('', VideoListCreateView.as_view(), name='video-list'),
    path('<int:pk>/', VideoDetailView.as_view(), name='video-detail'),
    path('<int:pk>/stream/', StreamVideoView.as_view(), name='video-stream'),
    path('<int:pk>/comments/', CommentListCreateView.as_view(), name='video-comments'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
]
