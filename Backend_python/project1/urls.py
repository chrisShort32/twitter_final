from django.urls import path
from . import views
from .views import (
    UserInfoView, PostInfoView, AllUsersView, AllFollowsView,
    fetch_user_tweets, fetch_user_profile, toggle_follow_user,
    search_user, like_tweet, retweet_tweet, submit_feedback,
    feedback_stats, feedback_options
)

urlpatterns = [
    path('all_users/', views.all_users, name='all_users'),
    path('check_user/', views.check_user_exists, name='check_user'),
    path('validate_new_user/', views.validate_signup_info, name='validate_info'),
    path('all_posts/', views.all_posts, name='all_posts'),
    path('view_all_posts/', PostInfoView.as_view(), name='post-info'),   
    path('api/user/<str:username>', UserInfoView.as_view(), name='user-info'),
    path('api/user/<str:username>/<str:checkInfo>/', views.get_user_info, name='get_user_info'),
    path('api/users/', AllUsersView.as_view(), name='all-users-api'),
    path('api/follows/', AllFollowsView.as_view(), name='all-follows-api'),
    path('api/username/<int:user_id>/', views.get_username_by_user_id, name='get-username-by-id'),
    path('api/follow-usernames/<int:follow_id>/', views.get_usernames_for_follow, name='get-follow-usernames'),
    path('api/follow_feed/<str:username>/', views.get_following_feed, name='get_following_feed'),
    path('api/like_unlike/', views.like_toggle, name='like_toggle'),
    path('api/reyeet_unreyeet/', views.reyeet_toggle, name='reyeet_toggle'),
    path('api/post_yeet/', views.yeet, name='yeet'),
    path('api/user_posts/<str:username>/', views.get_user_posts, name='get_user_posts'),
    path('search_users/', views.search_users, name='search_users'),
    path('user_profile/<str:username>/', views.user_profile, name='user_profile'),
    path('follow_toggle/', views.follow_toggle, name='follow_toggle'),
    path('like_tweet/', like_tweet, name='like_tweet'),
    path('retweet_tweet/', retweet_tweet, name='retweet_tweet'),
    path('api/feedback/', submit_feedback, name='submit_feedback'),
    path('api/feedback/stats/', feedback_stats, name='feedback_stats'),
    path('api/feedback/options/', feedback_options, name='feedback_options'),
]
