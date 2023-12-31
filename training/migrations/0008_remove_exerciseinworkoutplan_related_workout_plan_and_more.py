# Generated by Django 4.2.5 on 2023-10-18 11:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('training', '0007_rename_weight_id_bodyweight_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exerciseinworkoutplan',
            name='related_workout_plan',
        ),
        migrations.RemoveField(
            model_name='workoutplan',
            name='exercise_in_workout_plan',
        ),
        migrations.AddField(
            model_name='exerciseinworkoutplan',
            name='workout_plan',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='training.workoutplan'),
        ),
        migrations.AddField(
            model_name='workoutplan',
            name='exercises',
            field=models.ManyToManyField(through='training.ExerciseInWorkoutPlan', to='training.exercise'),
        ),
        migrations.AlterField(
            model_name='exerciseinworkoutplan',
            name='related_exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='training.exercise'),
        ),
    ]
