from django.db import migrations

def create_feedback_options(apps, schema_editor):
    FeedbackOption = apps.get_model('project1', 'FeedbackOption')
    
    # Positive options
    positive_options = [
        'Great user interface',
        'Easy to use',
        'Fast performance',
        'Good content',
        'Helpful features'
    ]
    
    # Negative options
    negative_options = [
        'Confusing interface',
        'Slow performance',
        'Poor content quality',
        'Missing features',
        'Too many bugs'
    ]
    
    for option in positive_options:
        FeedbackOption.objects.create(text=option, is_positive=True)
    
    for option in negative_options:
        FeedbackOption.objects.create(text=option, is_positive=False)

class Migration(migrations.Migration):

    dependencies = [
        ('project1', '0003_migrate_users'),
    ]

    operations = [
        migrations.RunPython(create_feedback_options),
    ] 