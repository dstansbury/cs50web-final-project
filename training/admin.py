from django.contrib import admin
from .models import Exercise, User, BodyWeight, WorkoutPlan, Workout, ExerciseInWorkoutPlan, ExerciseInWorkout, TrainingSet, PersonalBest

# Register your models here.
admin.site.register(Exercise)
admin.site.register(User)
admin.site.register(BodyWeight)
admin.site.register(WorkoutPlan)
admin.site.register(Workout)
admin.site.register(ExerciseInWorkoutPlan)
admin.site.register(ExerciseInWorkout)
admin.site.register(TrainingSet)
admin.site.register(PersonalBest)