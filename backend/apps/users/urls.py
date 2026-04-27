from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import RegisterView, ProfileView, EmailTokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    # Custom view: accepts {"email": "...", "password": "..."}
    path('login/', EmailTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token-verify'),
    path('profile/', ProfileView.as_view(), name='user-profile'),
]
