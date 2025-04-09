from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import UserInfoView, PostInfoView, AllUsersView, AllFollowsView, TopicViewSet

router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')

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
    path('api/', include(router.urls)),
]
