# Generated by Django 4.2.5 on 2023-12-10 21:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0012_rename_exercises_workoutplan_exercises_in_plan_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='personalbest',
            name='unit',
        ),
    ]
