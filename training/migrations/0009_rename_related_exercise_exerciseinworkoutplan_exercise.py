# Generated by Django 4.2.5 on 2023-10-18 11:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0008_remove_exerciseinworkoutplan_related_workout_plan_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='exerciseinworkoutplan',
            old_name='related_exercise',
            new_name='exercise',
        ),
    ]
