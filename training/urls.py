from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # PROFILE
    path("<int:userID>/profile/", views.profile, name="profile"),
    
    # WORKOUT PLANS
    path("<int:userID>/workout_plans/", views.workout_plans, name="workout_plans"),

    # EXERCISES
    path("<int:userID>/exercises/", views.exercises, name="exercises"),

    # WORKOUTS
    path("<int:userID>/workouts/<int:workout_plan_id>", views.workouts, name="workouts"),
    
]