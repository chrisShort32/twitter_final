from rest_framework import serializers
from .models import Posts, Follows, Likes, Retweets, FeedbackSurvey
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

class RetweetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retweets
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = FeedbackSurvey
        fields = ['feedback_id', 'user', 'username', 'likes_app', 'selected_reasons', 'created_at']
        read_only_fields = ['feedback_id', 'created_at']
    
    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return None