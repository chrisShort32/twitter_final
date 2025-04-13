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
from django.db import models
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

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
        print(f"{user.username}, {user.email}")
        user_data = {
            'exists': True,
	        'email': user.email,
    	    'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        return Response(user_data, status=200)
    except ObjectDoesNotExist:
        return Response({'exists': False}, status=200)
    except Exception as e:
        print("CHECK_USER ERROR:", str(e)) 
        return Response({'error': 'An unexpected error occurred'}, status=500)

#Final - Get google auth token
@api_view(['POST'])
def google_login(request):
    email = request.data.get('email')

    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
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
                    'latitude': post.latitude,
                    'longitude': post.longitude,
                    'location_name': post.location_name,
                    **get_like_data(post.post_id, user.id),
                    **get_retweet_data(post.post_id, user.id)

                })
        sorted_posts = sorted(post_info, key=lambda x: x['post_timestamp'], reverse=True)
        return Response(sorted_posts)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

# Final - Get the posts of the user for the 'My Posts' feed
@api_view(['GET'])
def get_user_posts(request, username):
    try:
        post_info = []
        user = User.objects.get(username=username)
        posts = Posts.objects.filter(user_id=user.id).order_by('-created_at')

        for post in posts:
            post_info.append({
                'user_id': post.user.id,
                'username': user.username,
                'post_id': post.post_id,
                'post_content': post.content,
                'post_timestamp': post.created_at,
                'latitude': post.latitude,
                'longitude': post.longitude,
                'location_name': post.location_name,
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
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        location_name = data.get('location_name')

        user = User.objects.get(username=username)

        Posts.objects.create(
            user_id=user.id,
            content=post_content,
            latitude=latitude,
            longitude=longitude,
            location_name=location_name
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

# Final - Search for users by username
@api_view(['GET'])
def search_users(request):
    query = request.GET.get('query', '')
    if not query:
        return Response({'error': 'Query parameter required'}, status=400)
    
    try:
        # Find users whose username or name contains the query string
        users = User.objects.filter(
            models.Q(username__icontains=query) | 
            models.Q(first_name__icontains=query) | 
            models.Q(last_name__icontains=query)
        )[:10]  # Limit to 10 results
        
        user_data = []
        for user in users:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                # You could add more user info here if needed
            })
        
        return Response(user_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Final - Get user profile by username
@api_view(['GET'])
def user_profile(request, username):
    try:
        # Get the requested user
        profile_user = User.objects.get(username=username)
        
        # Get the current logged-in user
        current_user = request.user
        
        # Check if current user follows this profile
        is_following = False
        if current_user.is_authenticated:
            is_following = Follows.objects.filter(
                user_id=current_user.id,
                following_user_id=profile_user.id
            ).exists()
        
        # Get followers count
        followers_count = Follows.objects.filter(following_user_id=profile_user.id).count()
        
        # Get following count
        following_count = Follows.objects.filter(user_id=profile_user.id).count()
        
        # Get user posts
        posts = Posts.objects.filter(user_id=profile_user.id).order_by('-created_at')
        posts_data = []
        
        for post in posts:
            post_data = {
                'post_id': post.post_id,
                'user_id': profile_user.id,
                'username': profile_user.username,
                'post_content': post.content,
                'post_timestamp': post.created_at,
                'latitude': post.latitude,
                'longitude': post.longitude,
                'location_name': post.location_name,
                **get_like_data(post.post_id, current_user.id if current_user.is_authenticated else None),
                **get_retweet_data(post.post_id, current_user.id if current_user.is_authenticated else None),
            }
            posts_data.append(post_data)
        
        # Get liked posts
        liked_posts_data = []
        if current_user.is_authenticated:
            likes = Likes.objects.filter(user_id=profile_user.id)
            for like in likes:
                post = like.post
                if post:
                    post_user = post.user
                    liked_post_data = {
                        'post_id': post.post_id,
                        'user_id': post_user.id,
                        'username': post_user.username,
                        'post_content': post.content,
                        'post_timestamp': post.created_at,
                        'latitude': post.latitude,
                        'longitude': post.longitude,
                        'location_name': post.location_name,
                        **get_like_data(post.post_id, current_user.id),
                        **get_retweet_data(post.post_id, current_user.id),
                    }
                    liked_posts_data.append(liked_post_data)
        
        # Get retweeted posts
        retweeted_posts_data = []
        if current_user.is_authenticated:
            retweets = Retweets.objects.filter(user_id=profile_user.id)
            for retweet in retweets:
                post = retweet.post
                if post:
                    post_user = post.user
                    retweeted_post_data = {
                        'post_id': post.post_id,
                        'user_id': post_user.id,
                        'username': post_user.username,
                        'post_content': post.content,
                        'post_timestamp': post.created_at,
                        'latitude': post.latitude,
                        'longitude': post.longitude,
                        'location_name': post.location_name,
                        **get_like_data(post.post_id, current_user.id),
                        **get_retweet_data(post.post_id, current_user.id),
                    }
                    retweeted_posts_data.append(retweeted_post_data)
        
        # Build the profile data
        profile_data = {
            'id': profile_user.id,
            'username': profile_user.username,
            'first_name': profile_user.first_name,
            'last_name': profile_user.last_name,
            'email': profile_user.email,
            'date_joined': profile_user.date_joined,
            'is_following': is_following,
            'followers_count': followers_count,
            'following_count': following_count,
            'posts_count': posts.count(),
            'posts': posts_data,
            'liked_posts': liked_posts_data,
            'retweeted_posts': retweeted_posts_data,
        }
        
        return Response(profile_data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Final - Toggle follow status for a user
@api_view(['POST'])
def follow_toggle(request):
    following_username = request.data.get('username')
    
    if not following_username:
        return Response({'error': 'Username is required'}, status=400)
    
    try:
        # Get the current user
        user = request.user
        
        # Get the user to follow/unfollow
        following_user = User.objects.get(username=following_username)
        
        # Check if already following
        follow_relationship = Follows.objects.filter(
            user_id=user.id, 
            following_user_id=following_user.id
        )
        
        if follow_relationship.exists():
            # Unfollow
            follow_relationship.delete()
            return Response({'status': 'unfollowed'})
        else:
            # Follow
            new_follow = Follows.objects.create(
                user_id=user.id,
                following_user_id=following_user.id,
                created_at=timezone.now()
            )
            return Response({'status': 'followed'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)



        