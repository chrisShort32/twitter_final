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
import json

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
def get_like_data(post_id, user_id):
    likes = Likes.objects.filter(post_id=post_id)
    return {
        'like_count': likes.count(),
        'liked_by_user': likes.filter(user_id=user_id).exists()
    }


# Final - Get 'retweet' information for a post
def get_retweet_data(post_id, user_id):
    retweets = Retweets.objects.filter(post_id=post_id)
    return {
         'retweet_count': retweets.count(),
         'retweeted_by_user': retweets.filter(user_id=user_id).exists()
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
                    **get_like_data(post.post_id, user.id),
                    **get_retweet_data(post.post_id, user.id)
                })

        return Response(post_info)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

# Final - Get the posts of the user for the 'My Posts' feed
@api_view(['GET'])
def get_user_posts(request, username):
    try:
        post_info = []
        user = User.objects.get(username=username)
        posts = Posts.objects.filter(user_id=user.id)

        for post in posts:
            post_info.append({
                'user_id': post.user.id,
                'username': user.username,
                'post_id': post.post_id,
                'post_content': post.content,
                'post_timestamp': post.created_at,
                **get_like_data(post.post_id, user.id),
                **get_retweet_data(post.post_id, user.id)
            })
        return Response(post_info)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
# Final - Add a post to the posts table
@api_view(['POST'])
def yeet(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        post_content = data.get('post_content')
        user = User.objects.get(username=username)

        Posts.objects.create(
           user_id=user.id,
           content=post_content
        )
        return JsonResponse({'status': 'Yeet successfully Yeeted'}, status=201)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Final - Like or Unlike a Post
@api_view(['POST'])
def like_toggle(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        post_id = data.get('post_id')
        user = User.objects.get(username=username)
        if Likes.objects.filter(user_id=user.id, post_id=post_id).exists():
            Likes.objects.filter(user_id=user.id, post_id=post_id).delete()
            return JsonResponse({'status': 'Yeet has been unliked'}, status=200)
        else:
            Likes.objects.create(
                user_id = user.id,
                post_id = post_id
            )
            return JsonResponse({'status': 'Yeet has been liked'}, status=201)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User does not exist'}, status=404)
    
# Final - ReYeet or UnReYeet a post
@api_view(['POST'])
def reyeet_toggle(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        post_id = data.get('post_id')
        user = User.objects.get(username=username)
        if Retweets.objects.filter(user_id=user.id, post_id=post_id).exists():
            Retweets.objects.filter(user_id=user.id, post_id=post_id).delete()
            return JsonResponse({'status': 'Yeet has been unReYeeted'}, status=200)
        else:
            Retweets.objects.create(
                user_id = user.id,
                post_id = post_id
            )
            return JsonResponse({'status': 'Yeet has been ReYeeted'}, status=201)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User does not exist'}, status=404)

# Final - Get User Information By Username
@api_view(['GET'])
def get_user_info(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        user = User.objects.get(username=username)

        follower_count = Follows.objects.filter(following_user_id=user.id).count()
        following_count = Follows.objects.filter(user_id=user.id).count()

        serializer = UserSerializer(user)
        user_data = serializer.data
        user_data['follower_count'] = follower_count
        user_data['following_count'] = following_count
        return Response(user_data)
    except User.DoesNotExist:
        return Response({'error': 'User not found!'}, status=404)

# Final - Get Posts a user has 'liked' By Username
@api_view(['GET'])
def get_liked_posts(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        user = User.objects.get(username=username)
        likes = Likes.objects.filter(user_id=user.id)
        liked_posts = []
        for like in likes:
            post = Posts.objects.select_related('user').get(post_id=like.post_id)
            posting_user = post.user
            liked_posts.append({
                'user_id': posting_user.id,
                'username': posting_user.username,
                'post_id': post.post_id,
                'post_content': post.content,
                **get_like_data(post.post_id, user.id)
            })
        return Response(liked_posts, status=200)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
# Final - Get Posts a user has reYeeted By Username
@api_view(['GET'])
def get_reyeeted_posts(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        user = User.objects.get(username=username)
        reyeets = Retweets.objects.filter(user_id=user.id)
        reyeeted_posts = []
        for reyeet in reyeets:
            post = Posts.objects.select_related('user').get(post_id=reyeet.post_id)
            posting_user = post.user
            reyeeted_posts.append({
                'user_id': posting_user.id,
                'username': posting_user.username,
                'post_id': post.post_id,
                'post_content': post.content,
                **get_retweet_data(post.post_id, user.id)
            })
        return Response(reyeeted_posts, status=200)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
# Final - Follow/Unfollow toggle
@api_view(['POST'])
def follow_unfollow(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        follows_username = data.get('follows_username')
        user = User.objects.get(username=username)
        follows_user = User.objects.get(username=follows_username)
        if Follows.objects.filter(user_id=user.id, following_user_id=follows_user.id).exists():
            Follows.objects.get(user_id=user.id, following_user_id=follows_user.id).delete()
            return JsonResponse({'status': f'You have unfollowed {follows_username}'}, status=201)
        else:
            Follows.objects.create(
                user_id = user.id,
                following_user_id = follows_user.id
            )
            return JsonResponse({'status': f'You have followed {follows_username}'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User does not exist'}, status=404)

        