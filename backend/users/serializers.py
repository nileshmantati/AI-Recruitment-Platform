from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, CandidateProfile
from rest_framework.exceptions import AuthenticationFailed

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone')

class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = ('id', 'skills', 'experience', 'portfolio_url', 'github_url', 'bio')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) # Ensures password isn't returned in JSON

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'phone')

    def create(self, validated_data):
        # Create the user securely, hashing the password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'CANDIDATE'),
            phone=validated_data.get('phone', '')
        )
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that includes user role and username in the response."""
    role = serializers.CharField(write_only=True, required=False)
    
    def validate(self, attrs):
        provided_role = attrs.get('role')
        data = super().validate(attrs)
        
        # Enforce that the role selected on the frontend matches the user's actual role
        if provided_role and self.user.role != provided_role:
            raise AuthenticationFailed("Invalid role selected. Please select your correct role to log in.")

        # Add extra fields to the response (not the token itself)
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['user_id'] = self.user.id
        return data