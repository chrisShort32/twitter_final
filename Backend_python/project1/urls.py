from django.urls import path
from . import views
from .views import PostInfoView, AllUsersView, AllFollowsView
urlpatterns = [
    path('all_users/', views.all_users, name='all_users'),
    path('check_user/', views.check_user_exists, name='check_user'),
    path('validate_new_user/', views.validate_signup_info, name='validate_info'),
    path('all_posts/', views.all_posts, name='all_posts'),
    path('view_all_posts/', PostInfoView.as_view(), name='post-info'),   
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
    path('api/user_info/', views.get_user_info, name='user_info'),
    path('api/liked_posts/', views.get_liked_posts, name='liked_posts'),
    path('api/reyeeted_posts/', views.get_reyeeted_posts, name='reyeeted_posts'),
    path('api/follow_unfollow/', views.follow_unfollow, name='follow_toggle'),
]