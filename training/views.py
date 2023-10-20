import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.http import JsonResponse
from django.urls import reverse
from django.db.models.query import QuerySet
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.shortcuts import render, HttpResponseRedirect, HttpResponse

from .models import Exercise, User, BodyWeight, WorkoutPlan, Workout, ExerciseInWorkoutPlan, ExerciseInWorkout, TrainingSet, BrokenSet, PersonalBest
""" 
SECURITY CHECKS
"""
def userOwned(request, userID):
    if request.user.id != int(userID):
        # create an error message
        messages.warning(request, 'Access to others\' information is not allowed. Redirecting to your own profile.')
        return HttpResponseRedirect(reverse("profile", args=(request.user.id,)))
"""
END SECURITY CHECKS
"""

"""
HOME (INDEX)
"""
# if the user is authenticated, redirect to profile page.
# if a user is not authenticated, render the index page.
# if authenticated user wishes to view the index page, they will go via the home route.
def index(request):
    if request.user.is_authenticated:
        userID = request.user.id
        return HttpResponseRedirect(reverse("profile", args=(userID,)))
    else:
        return render(request, "training/index.html")
"""
END HOME (INDEX)
"""

""" 
PROFILE
"""
def profile(request, userID):
    # Check if the user is logged in, if not send to login page
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    # Security check
    userOwned(request, userID)

    # grab all the user's info from the DB and return them as JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        #to be filled
        #

        # Return data in structured format
        userProfileData = {
            "blank": blank,
            # to be filled
        }
        
        return JsonResponse(userProfileData, safe=False)
    
    #If it's not an AJAX request, render the profile page
    else:
        return render(request, "training/profile.html", {
            "userID": userID,
            "username": request.user.username
        })

# Error path
def no_user_profile(request):
    # create an error message
    messages.warning(request, 'Invalid profile access. Redirecting to the main page.')
    # redirect to the index page with the message to display.
    return HttpResponseRedirect('/') 
"""
END PROFILE
"""

"""
WORKOUT PLANS
"""
def workout_plans(request, userID):
    # Check if the user is logged in, if not send to login page
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    # Security check
    userOwned(request, userID)

    if request.method == "GET":
        # grab all the user's info from the DB and return them as JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            workout_plans = WorkoutPlan.objects.filter(plan_user=userID)

            serialized_workout_plans = []
            
            for plan in workout_plans:
                serialized_workout_plans.append(plan.serialize())
            
            return JsonResponse(serialized_workout_plans, safe=False)
        
        #If it's not an AJAX request, render the workout plans page
        else:
            return render(request, "training/workout_plans.html", {
                "userID": userID,
                "username": request.user.username
            })
    elif request.method == "POST":
        try:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                
                # Get the data from the request
                data = json.loads(request.body)

                # Check essential data is there
                if not data.get("title") or not data.get("user_id") or not data.get("exercises_in_plan"):
                    return JsonResponse({"error": "Missing necessary fields."}, status=400)
                
                user_instance = User.objects.get(id=data.get("user_id"))
            
            new_workout_plan = WorkoutPlan(
                title=data.get("title"),
                description=data.get("description"),
                plan_user=user_instance,
            )
            new_workout_plan.save()
            print(f"new workout plan saved: {new_workout_plan}")

            for exercise_data in data.get("exercises_in_plan"):
                exercise_instance = Exercise.objects.get(id=exercise_data.get("id"))
                
                new_exercise_in_workout_plan = ExerciseInWorkoutPlan(
                    exercise=exercise_instance,
                    workout_plan=new_workout_plan,
                    sets_in_workout=exercise_data.get("sets_in_workout"),
                    reps_per_set=exercise_data.get("reps_per_set"),
                )
                new_exercise_in_workout_plan.save()
                print(f"new exercise in workout plan saved: {new_exercise_in_workout_plan}")

                # Return a success HTTP response
                return JsonResponse({"message": "Workout Plan successfully created."}, status=201) 
        
        except Exception as e:
            print(f"error is {e}")
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=400)

# Error path
def no_user_workout_plans(request):
    # create an error message
    messages.warning(request, 'Invalid workout plan access. Redirecting to the main page.')
    # redirect to the index page with the message to display.
    return HttpResponseRedirect('/') 

"""
END WORKOUT PLANS
"""

"""
EXERCISES
"""
def exercises(request, userID):
    # Check if the user is logged in, if not send to login page
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    # Security check
    userOwned(request, userID)

    # grab all the user's exercises info from the DB and return them as JSON
    if request.method == "GET":
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            user_exercises = Exercise.objects.filter(added_by_user=userID)

            serialized_exercises = []
            
            for exercise in user_exercises:
                serialized_exercises.append(exercise.serialize())
            
            return JsonResponse(serialized_exercises, safe=False)
        
        #If it's not an AJAX request, render the workout_plans page
        else:
            return render(request, "training/workout_plans.html", {
                "userID": userID,
                "username": request.user.username
            })
    elif request.method == "POST":
        try:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                
                # Get the data from the request
                data = json.loads(request.body)

                # Check essential data is there
                if not data.get("name"):
                    return JsonResponse({"error": "Missing necessary fields."}, status=400)
                
                # Create the new exercise
                new_exercise = Exercise(
                    name=data.get("name"),
                    description=data.get("description"),
                    added_by_user=request.user,
                )
                new_exercise.save()

                # Return a success HTTP response
                return JsonResponse({"message": "Exercise successfully created."}, status=201) 
        except Exception as e:
            print(f"error is {e}")
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=400)

# Error path
def no_user_exercises(request):
    # create an error message
    messages.warning(request, 'Invalid exercises access. Redirecting to the main page.')
    # redirect to the index page with the message to display.
    return HttpResponseRedirect('/') 

"""
END EXERCISES
"""

"""
LOGIN
"""
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("profile"))
        else:
            return render(request, "login", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "training/login.html")
    
"""
END LOGIN
"""

"""
LOGOUT
"""
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

"""
END LOGOUT
"""

"""
REGISTER
"""
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "training/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "training/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("profile"))
    else:
        return render(request, "training/register.html")
    
"""
END REGISTER
"""
    
