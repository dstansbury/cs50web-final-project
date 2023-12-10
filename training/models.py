from django.contrib.auth.models import AbstractUser
from django.db import models

class WeightUnit(models.TextChoices):
    KG = 'kg', 'Kilogram'
    LBS = 'lbs', 'Pounds'
    UNKNOWN = 'unknown', 'Unknown'

class Exercise(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    name = models.CharField(max_length=100, null=False, blank=False)
    description = models.CharField(max_length=500, null=True, blank=True)
    added_by_user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="exercise", null=False, blank=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "added_by_user": self.added_by_user.id,
        }
    
    def __str__(self): 
         return (f"{self.added_by_user}: {self.name}, ID: {self.id}")
    
    
class User(AbstractUser):
    pass

class BodyWeight(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=False, blank=False)
    unit = models.CharField(max_length=7, choices=WeightUnit.choices, default=WeightUnit.UNKNOWN, null=False, blank=False)
    date = models.DateField(null=False, blank=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="BodyWeight", null=False, blank=False)

    def serialize(self):
        return {
            "id": self.id,
            "weight": self.weight,
            "unit": self.unit,
            "date": self.date,
            "user": self.user.id,
        }
    
    def __str__(self):
        return (f"{self.user.username} body weight on: {self.date}")

class WorkoutPlan(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    title = models.CharField(max_length=100, null=False, blank=False)
    description = models.CharField(max_length=500, null=True, blank=True)
    exercises_in_plan = models.ManyToManyField(Exercise, through='ExerciseInWorkoutPlan')
    plan_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workout_plan", null=False, blank=False)

    def serialize(self):
        exercises_details = []
        for exercise_detail in self.exerciseinworkoutplan_set.all():
            exercises_details.append({
                "id": exercise_detail.exercise.id,
                "name": exercise_detail.exercise.name,
                "sets_in_workout": exercise_detail.sets_in_workout,
                "reps_per_set": exercise_detail.reps_per_set,
            })
        
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "exercises_in_plan": exercises_details,
            "plan_user": self.plan_user.id,
        }
    
    def __str__(self): 
         return (self.title) 
    
class Workout(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workout", null=False, blank=False)
    workout_plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name="plan_workout", null=False, blank=False)
    date = models.DateField(null=False, blank=False)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.id,
            "workout_plan": self.workout_plan.title,
            "date": self.date,
        }
    
    def __str__(self):
        return (f"{self.workout_plan.title}: {self.date}")

class ExerciseInWorkoutPlan(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    workout_plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, null=True)
    sets_in_workout = models.IntegerField(null=False, blank=False)
    reps_per_set = models.IntegerField(null=False, blank=False)

    def serialize(self):
        return {
            "id": self.id,
            "exercise": self.exercise,
            "workout_plan": self.workout_plan,
            "sets_in_workout": self.sets_in_workout,
            "reps_per_set": self.reps_per_set,
        }
    
    def __str__(self): 
         return (f"{self.exercise.name} in {self.workout_plan.title}")

class ExerciseInWorkout(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name="exercise_in_workout_exercise", null=False, blank=False)
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="workout_exercise_in_workout", null=False, blank=False)

    def serialize(self):
        return {
            "id": self.id,
            "exercise": self.exercise,
            "workout": self.workout,
        }
    
    def __str__(self): 
         return (f"{self.exercise.name} in workout {self.workout.id}")

class TrainingSet(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    exercise = models.ForeignKey(ExerciseInWorkout, on_delete=models.CASCADE, related_name="set", null=False, blank=False)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=False, blank=False)
    reps = models.IntegerField(null=False, blank=False)
    unit = models.CharField(max_length=7, choices=WeightUnit.choices, default=WeightUnit.UNKNOWN, null=False, blank=False)

    def serialize(self):
        return {
            "id": self.id,
            "exercise": self.exercise,
            "weight": self.weight,
            "reps": self.reps,
            "unit": self.unit,
        }
    
    def __str__(self): 
         return (f"{self.exercise.exercise.name} in workout {self.exercise.workout.id}")
    
class PersonalBest(models.Model):
    id = models.AutoField(primary_key=True, null=False)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name="personal_best", null=False, blank=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="personal_best_user", null=False, blank=False)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=False, blank=False)
    date = models.DateField(null=False, blank=False)

    def serialize(self):
        return {
            "id": self.id,
            "exercise": self.exercise.id,
            "user": self.user.id,
            "weight": self.weight,
            "date": self.date,
        }
    
    def __str__(self): 
         return (f"{self.user.username}: {self.exercise.name}")
