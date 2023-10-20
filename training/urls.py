from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # PROFILE
    #error handling path
    path("profile/", views.no_user_profile, name="no_user_profile"),
    #actual path
    path("<int:userID>/profile/", views.profile, name="profile"),

    # WORKOUT PLANS
    #error handling path
    path("workout_plans/", views.no_user_workout_plans, name="no_user_workout_plans"),
    #actual path
    path("<int:userID>/workout_plans/", views.workout_plans, name="workout_plans"),

    # EXERCISES
    #error handling path
    path("exercises/", views.no_user_exercises, name="no_user_exercises"),
    #actual path
    path("<int:userID>/exercises/", views.exercises, name="exercises"),
    
]