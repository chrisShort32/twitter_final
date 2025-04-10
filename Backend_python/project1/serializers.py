from rest_framework import serializers
from .models import Posts, Follows, Likes, Retweets
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

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Likes
        fields = '__all__'

class RetweetSerializer(serializer.ModelSerializer):
    class Meta:
        model = Retweets
        fields = '__all__'