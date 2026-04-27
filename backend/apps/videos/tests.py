from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from apps.users.models import User
from .models import Video, Category


class VideoAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='videouser',
            email='video@example.com',
            password='StrongPass123!',
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name='Tech', slug='tech')

    def test_video_list_is_public(self):
        self.client.force_authenticate(user=None)
        url = reverse('video-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_upload_requires_auth(self):
        self.client.force_authenticate(user=None)
        url = reverse('video-list')
        response = self.client.post(url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_category_list(self):
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
