from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    SimpleJWT по умолчанию ищет поле 'username'.
    Т.к. USERNAME_FIELD = 'email', переопределяем поле явно.
    """
    username_field = User.USERNAME_FIELD  # 'email'

    def validate(self, attrs):
        # SimpleJWT читает attrs[self.username_field] — т.е. attrs['email']
        return super().validate(attrs)


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Пароли не совпадают.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'bio', 'created_at')
        read_only_fields = ('id', 'email', 'created_at')
