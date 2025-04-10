from rest_framework import viewsets
from django.shortcuts import render
from .models import Posts, Follows, Likes, Retweets
from rest_framework.response import Response
from .serializers import UserSerializer, PostSerializer, FollowSerializer, LikeSerializer, RetweetSerializer
from rest_framework import status
from rest_framework.views import APIView
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from django.core.exceptions import ObjectDoesNotExist

# this is a simple version of getting all the users that i made when
# i first started learning. I think using apiView is better. 
# its not needed anymore, but i wont delete it.
def all_users(request):
    users = User.objects.all()
    return render(request, 'all_users.html', {'users': users})

# i dont know if this is used anywhere and i am scared to delete it
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def list(self, request, *args, **kwargs):
        users = User.objects.all().prefectch_related('posts', 'follows')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


# This is used in project1
class UserInfoView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)


class PostInfoView(APIView):
    def get(self, request):
        posts = Posts.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

# This function is for project1
def get_user_info(request, username, checkInfo):
    # Get the 'info' parameter from the URL (default to 'Follows' if not provided)

    try:
        # Fetch the user object based on the username
        user = User.objects.get(username=username)
        user_id = user.user_id  # Get the user's ID to use in the queries

        # Determine what data to return based on the 'info' parameter
        if checkInfo == 'Follows':
            # Fetch the list of users who are following the given user (using user_id)
            follows_data = Follows.objects.filter(user_id=user_id)
            data = []
            for follow_data in follows_data:
                user_being_followed = User.objects.get(id=follow_data.following_user_id)
                data.append(user_being_followed.username)
 
        elif checkInfo == 'Following':
            # Fetch the list of users that the given user is following (using user_id)
            following = Follows.objects.filter(following_user_id=user_id)
            data = []
            for follow in following:
                following_user = User.objects.get(id=follow.user_id)
                data.append(following_user.username)

        elif checkInfo == 'Posts':
            # Fetch the user's posts (using user_id)
            posts = Posts.objects.filter(user_id=user_id)
            data = [post.content for post in posts]  # List of posts' content
        else:
            data = []

        return JsonResponse(data, safe=False)

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found!"}, status=404)
# Create your views here.

# Get all the posts from the database
# This isnt used in anything important, but i still wont delete it. =]
def all_posts(request):
    posts = Posts.objects.all()
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)


class AllUsersView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class AllFollowsView(APIView):
    def get(self, request):
        follows = Follows.objects.all()
        serializer = FollowSerializer(follows, many=True)
        return Response(serializer.data)

def get_username_by_user_id(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        return JsonResponse({'username': user.username})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found!'}, status=404)

def get_usernames_for_follow(request, follow_id):
    try:
        # The Follows model doesn't have an 'id' field, so we need to find a follow relationship
        # where either user_id or following_user_id matches the provided follow_id
        follows = Follows.objects.filter(user_id=follow_id)
        
        if follows.exists():
            # Get the first matching follow relationship
            follow = follows.first()
            user = User.objects.get(id=follow.user_id)
            following_user = User.objects.get(id=follow.following_user_id)
            
            return JsonResponse({
                'user_id': follow.user_id,
                'username': user.username,
                'following_user_id': follow.following_user_id,
                'following_username': following_user.username
            })
        else:
            # Try finding a follow relationship where the user is being followed
            follows = Follows.objects.filter(following_user_id=follow_id)
            if follows.exists():
                follow = follows.first()
                user = User.objects.get(id=follow.user_id)
                following_user = User.objects.get(id=follow.following_user_id)
                
                return JsonResponse({
                    'user_id': follow.user_id,
                    'username': user.username,
                    'following_user_id': follow.following_user_id,
                    'following_username': following_user.username
                })
            else:
                return JsonResponse({'error': 'No follow relationship found for this ID!'}, status=404)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found!'}, status=404)

# Project 2 - Check if user exists by email
@api_view(['POST'])
def check_user_exists(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        print(user.username, user.email)
        user_data = {
            'exists': True,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        return Response(user_data, status=200)
    except ObjectDoesNotExist:
        return Response({'exists': False}, status=200)
    except Exception as e:
        return Response({'error': 'An unexpected error occurred'}, status=500)

# Final - Verify username and email dont exist
@api_view(['POST'])
def validate_signup_info(request):
    username = request.data.get('username')
    email = request.data.get('email')

    if User.objects.filter(email=email).exists():
        return Response({"email_exists": True}, status=404)
    elif User.objects.filter(username=username).exists():
        return Response({"username_exists": True}, status=404)
    else:
        return Response({"email_username exists": False}, status=200)
    

# Final - Get 'like' information for a post
def get_like_data(post_id, user):
    likes = Likes.objects.filter(post_id=post_id)
    return {
        'like_count': likes.count,
        'liked_by_user': likes.filter(user=user).exists()
    }


# Final - Get 'retweet' information for a post
def get_retweet_data(post_id, user):
    retweets = Retweets.objects.filter(post_id=post_id)
    return {
         'retweet_count': retweets.count(),
         'retweeted_by_user': retweets.filter(user=user).exists()
    }

# Final - Get the posts of the users that the original user follows
@api_view(['GET'])
def get_following_feed(request, username):
    try: 
        # Get the user info from the username
        user = User.objects.get(username=username)
        # Get the people the user follows from the user id
        follow_relationships = Follows.objects.filter(user_id=user.id)
    
        post_info = []
        for follow in follow_relationships:
            followed_user = User.objects.get(id=follow.following_user_id)
            # Get the posts by user id
            posts = Posts.objects.filter(user_id=followed_user.id)
            for post in posts:
                post_info.append({
                    'user_id': post.user.id,
                    'username': followed_user.username,
                    'post_id': post.post_id,
                    'post_content': post.content,
                    'post_timestamp': post.created_at,
                    **get_like_data(post.post_id, user),
                    **get_retweet_data(post.post_id, user)
                })

        return Response(post_info)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

