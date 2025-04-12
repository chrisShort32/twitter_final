from django.db import migrations
from django.contrib.auth.models import User
from project1.models import Users

def migrate_users(apps, schema_editor):
    try:
        old_users = Users.objects.all()

        for old_user in old_users:
            # Check if user already exists
            if not User.objects.filter(username=old_user.username).exists():
                user = User(
                    username=old_user.username,
                    email=old_user.email,
                    first_name=old_user.first_name,
                    last_name=old_user.last_name,
                    date_joined=old_user.created_at,
                    is_active=True,
                    is_staff=False,
                    is_superuser=False,
                )

                # hash the password and set it
                user.set_password(old_user.password)
                user.save()
    except Exception as e:
        # If the table doesn't exist or any other issue, just pass
        # This is a migration for MySQL to SQLite transition
        print(f"Migration issue: {e}")
        pass

class Migration(migrations.Migration):
    dependencies = [
        ('project1','0002_authgroup_authgrouppermissions_authpermission_and_more')
    ]

    operations = [
        migrations.RunPython(migrate_users, reverse_code=migrations.RunPython.noop),
    ]
