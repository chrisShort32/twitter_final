from rest_framework import serializers
from .models import Users, Posts, Follows, Topic

class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follows
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):    

    class Meta:
        model = Users
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
   
     class  Meta:
        model = Posts
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'
