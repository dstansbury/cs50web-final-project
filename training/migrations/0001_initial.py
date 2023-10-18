# Generated by Django 4.2.5 on 2023-10-17 13:38

from django.conf import settings
import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Exercise',
            fields=[
                ('exercise_ID', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=500)),
                ('related_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exercise', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ExerciseInWorkout',
            fields=[
                ('exercise_in_workout_ID', models.AutoField(primary_key=True, serialize=False)),
                ('related_exercise', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exercise_in_workout_exercise', to='training.exercise')),
            ],
        ),
        migrations.CreateModel(
            name='ExerciseInWorkoutPlan',
            fields=[
                ('exercise_in_workout_plan_ID', models.AutoField(primary_key=True, serialize=False)),
                ('sets_in_workout', models.IntegerField()),
                ('reps_per_set', models.IntegerField()),
                ('related_exercise', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exercise_in_workout_plan', to='training.exercise')),
            ],
        ),
        migrations.CreateModel(
            name='WorkoutPlan',
            fields=[
                ('workout_ID', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=500)),
                ('related_exercise_in_workout_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workout_plan_exercise', to='training.exerciseinworkoutplan')),
                ('related_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workout_plan', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Workout',
            fields=[
                ('workout_ID', models.AutoField(primary_key=True, serialize=False)),
                ('date', models.DateField()),
                ('related_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workout', to=settings.AUTH_USER_MODEL)),
                ('related_workout_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='plan_workout', to='training.workoutplan')),
            ],
        ),
        migrations.CreateModel(
            name='Set',
            fields=[
                ('set_ID', models.AutoField(primary_key=True, serialize=False)),
                ('weight', models.DecimalField(decimal_places=2, max_digits=5)),
                ('reps', models.IntegerField()),
                ('unit', models.CharField(choices=[('kg', 'Kilogram'), ('lbs', 'Pounds'), ('unknown', 'Unknown')], default='unknown', max_length=7)),
                ('is_broken_set', models.BooleanField(default=False)),
                ('related_exercise_in_workout', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='set', to='training.exerciseinworkout')),
            ],
        ),
        migrations.CreateModel(
            name='PersonalBest',
            fields=[
                ('personal_best_ID', models.AutoField(primary_key=True, serialize=False)),
                ('weight', models.DecimalField(decimal_places=2, max_digits=5)),
                ('unit', models.CharField(choices=[('kg', 'Kilogram'), ('lbs', 'Pounds'), ('unknown', 'Unknown')], default='unknown', max_length=7)),
                ('date', models.DateField()),
                ('related_exercise', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='personal_best', to='training.exercise')),
                ('related_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='personal_best_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='exerciseinworkoutplan',
            name='related_workout_plan',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workout_plan_exercise_in_plan', to='training.workoutplan'),
        ),
        migrations.AddField(
            model_name='exerciseinworkout',
            name='related_workout',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workout_exercise_in_workout', to='training.workout'),
        ),
        migrations.CreateModel(
            name='BrokenSet',
            fields=[
                ('broken_set_ID', models.AutoField(primary_key=True, serialize=False)),
                ('weight', models.DecimalField(decimal_places=2, max_digits=5)),
                ('reps', models.IntegerField()),
                ('unit', models.CharField(choices=[('kg', 'Kilogram'), ('lbs', 'Pounds'), ('unknown', 'Unknown')], default='unknown', max_length=7)),
                ('related_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='broken_set', to='training.set')),
            ],
        ),
        migrations.CreateModel(
            name='BodyWeight',
            fields=[
                ('weight_ID', models.AutoField(primary_key=True, serialize=False)),
                ('weight', models.DecimalField(decimal_places=2, max_digits=5)),
                ('unit', models.CharField(choices=[('kg', 'Kilogram'), ('lbs', 'Pounds'), ('unknown', 'Unknown')], default='unknown', max_length=7)),
                ('date', models.DateField()),
                ('related_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='BodyWeight', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='user',
            name='related_exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_exercise', to='training.exercise'),
        ),
        migrations.AddField(
            model_name='user',
            name='related_workout_plan',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_workout_plan', to='training.workoutplan'),
        ),
        migrations.AddField(
            model_name='user',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions'),
        ),
    ]
