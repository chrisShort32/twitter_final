from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from .views import PostInfoView, AllUsersView, AllFollowsView, google_login
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
    path('auth/google-login/', google_login),
    path('api/follow_feed/<str:username>/', views.get_following_feed, name='get_following_feed'),
    path('api/like_unlike/', views.like_toggle, name='like_toggle'),
    path('api/reyeet_unreyeet/', views.reyeet_toggle, name='reyeet_toggle'),
    path('api/post_yeet/', views.yeet, name='yeet'),
    path('api/user_posts/<str:username>/', views.get_user_posts, name='get_user_posts'),
    path('api/profile_pic/', views.get_profile_pic, name='profile_pic'),
    path('search_users/', views.search_users, name='search_users'),
    path('user_profile/<str:username>/', views.user_profile, name='user_profile'),
    path('follow_toggle/', views.follow_toggle, name='follow_toggle'),
    
    # Feedback survey endpoints
    path('api/feedback/', views.submit_feedback, name='submit_feedback'),
    path('api/feedback/stats/', views.get_feedback_stats, name='get_feedback_stats'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)