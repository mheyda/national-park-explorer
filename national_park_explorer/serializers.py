from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import CustomUser, UploadedFile


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)
        # Add custom claims
        # E.g. token['username'] = user.username
        return token


class CustomUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        if password is not None:
            user.set_password(password)
        user.save()
        return user
    

class FileUploadSerializer(serializers.ModelSerializer):

    class Meta:
        model = UploadedFile
        fields = ['user', 'file', 'original_filename', 'file_type']
        read_only_fields = ['user', 'original_filename', 'file_type']