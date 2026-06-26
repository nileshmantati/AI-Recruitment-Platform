from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, CandidateProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone')

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
        
        # Automatically create a CandidateProfile if the user is a candidate
        if user.role == 'CANDIDATE':
            CandidateProfile.objects.create(user=user)
            
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that includes user role and username in the response."""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra fields to the response (not the token itself)
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['user_id'] = self.user.id
        return data