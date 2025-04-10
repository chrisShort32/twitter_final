from rest_framework import serializers
from .models import Posts, Follows
from django.contrib.auth.models import User

class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follows
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):    

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'last_login']

class PostSerializer(serializers.ModelSerializer):
   
     class  Meta:
        model = Posts
        fields = '__all__'
