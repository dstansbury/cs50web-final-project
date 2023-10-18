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

    # grab all the user's info from the DB and return them as JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        workout_plans = WorkoutPlan.objects.filter(plan_user=userID)

        serialized_workout_plans = []
        
        for plan in workout_plans:
            serialized_workout_plans.append(plan.serialize())

        print(f"serialized_workout_plans: {serialized_workout_plans}")
        
        return JsonResponse(serialized_workout_plans, safe=False)
    
    #If it's not an AJAX request, render the profile page
    else:
        return render(request, "training/workout_plans.html", {
            "userID": userID,
            "username": request.user.username
        })

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
    
