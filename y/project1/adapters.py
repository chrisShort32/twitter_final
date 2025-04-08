from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from django.contrib.auth.models import User
from .models import Users
from django.conf import settings
import datetime

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed.
        This hook allows you to implement custom logic to handle the user
        data from the social provider.
        """
        # Get email from social account
        email = sociallogin.account.extra_data.get('email')
        
        # Get or create user in our Users table
        if email:
            try:
                # Check if user already exists in our Users table
                user = Users.objects.get(email=email)
                
                # If user exists, connect the social account
                sociallogin.connect(request, user)
            except Users.DoesNotExist:
                # Create a new user in our Users table
                first_name = sociallogin.account.extra_data.get('given_name', '')
                last_name = sociallogin.account.extra_data.get('family_name', '')
                username = email.split('@')[0]  # Use the part before @ as username
                
                # Check if username exists, append numbers if it does
                base_username = username
                count = 1
                while Users.objects.filter(username=username).exists():
                    username = f"{base_username}{count}"
                    count += 1
                
                # Create new user
                new_user = Users.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    username=username,
                    email=email,
                    password='',  # No password for OAuth users
                    phone='',  # No phone for OAuth users
                    created_at=datetime.datetime.now(),
                )
                
                # Connect the social account
                sociallogin.connect(request, new_user)

class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        This is called when saving user via allauth registration.
        We override this to save additional fields to our Users model.
        """
        user = super(CustomAccountAdapter, self).save_user(request, user, form, commit=False)
        
        # Add custom fields here if needed
        user.save()
        
        # Create a corresponding entry in our Users table
        if commit:
            try:
                Users.objects.get(email=user.email)
            except Users.DoesNotExist:
                Users.objects.create(
                    first_name=user.first_name,
                    last_name=user.last_name,
                    username=user.username,
                    email=user.email,
                    password='',  # Set a default password or generate one
                    phone='',  # Set a default phone or leave empty
                    created_at=datetime.datetime.now(),
                )
        
        return user 