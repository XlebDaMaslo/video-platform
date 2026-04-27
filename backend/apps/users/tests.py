from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User


class UserRegistrationTest(APITestCase):
    def test_register_success(self):
        url = reverse('user-register')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_register_passwords_mismatch(self):
        url = reverse('user-register')
        data = {
            'username': 'testuser2',
            'email': 'test2@example.com',
            'password': 'StrongPass123!',
            'password2': 'WrongPass456!',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        user = User.objects.create_user(
            username='loginuser',
            email='login@example.com',
            password='StrongPass123!',
        )
        url = reverse('token-obtain-pair')
        response = self.client.post(url, {
            'email': 'login@example.com',
            'password': 'StrongPass123!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
