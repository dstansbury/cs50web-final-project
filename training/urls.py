from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # WORKOUT PLANS
    #actual path
    path("<int:userID>/workout_plans/", views.workout_plans, name="workout_plans"),

    # EXERCISES
    #actual path
    path("<int:userID>/exercises/", views.exercises, name="exercises"),

    # WORKOUTS
    #actual path
    path("<int:userID>/workouts/<int:workout_plan_id>", views.workouts, name="workouts"),
    
]