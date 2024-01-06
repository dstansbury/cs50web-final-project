import json
from datetime import datetime
from decimal import Decimal
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from django.http import JsonResponse
from django.urls import reverse
from django.core import serializers
from django.shortcuts import render, HttpResponseRedirect

from .models import Exercise, User, BodyWeight, WorkoutPlan, Workout, ExerciseInWorkoutPlan, ExerciseInWorkout, TrainingSet, PersonalBest
""" 
SECURITY CHECKS
"""
def userOwned(currentRequest, userID):
    if currentRequest.user.id != int(userID):
        # create an error message
        messages.warning(currentRequest, 'Access to others\' information is not allowed. Redirecting to your own profile.')
        return HttpResponseRedirect(reverse("profile", args=(currentRequest.user.id,)))
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

    if request.method == "GET":
        return render(request, "training/profile.html", {
            "userID": userID,
            "username": request.user.username
        })
    
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
    # If it's a post request, put the new plan in the DB
    elif request.method == "POST":
        try:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                
                # Get the data from the request
                data = json.loads(request.body)

                # Check essential data is there
                if not data.get("title") or not data.get("user_id") or not data.get("exercises_in_plan"):
                    return JsonResponse({"error": "Missing necessary fields."}, status=400)
            
                # Create the new workout plan
                new_workout_plan = WorkoutPlan(
                    title=data.get("title"),
                    description=data.get("description"),
                    plan_user=User.objects.get(id=data.get("user_id")),
                )
                # Save the new workout plan
                new_workout_plan.save()
                print(f"new workout plan saved: {new_workout_plan}")

                exercises_in_plan = data.get("exercises_in_plan")
                for exercise_data in exercises_in_plan:
                    
                    new_exercise_in_workout_plan = ExerciseInWorkoutPlan(
                        workout_plan=new_workout_plan,
                        sets_in_workout=exercise_data.get("exerciseSets"),
                        reps_per_set=exercise_data.get("exerciseReps"),
                        exercise=Exercise.objects.get(id=exercise_data.get("exerciseID")),
                        )
                    print(f"new_exercise_in_workout_plan is {new_exercise_in_workout_plan}")
                    new_exercise_in_workout_plan.save()
                    print(f"new exercise in workout plan saved: {new_exercise_in_workout_plan}")

                # Return a success HTTP response
                return JsonResponse({"message": "Workout Plan successfully created."}, status=201) 
        
        except Exception as e:
            print(f"error is {e}")
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=400)
    
    # If method is PUT, update the workout plan
    elif request.method == "PATCH":
        try:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                
                # Get the data from the request
                data = json.loads(request.body)

                print(f"data is {data}")

                # Check essential data is there
                if not data.get("workout_id"):
                    return JsonResponse({"error": "Missing necessary fields."}, status=400)
                
                # Get the workout plan instance
                updated_workout_plan = WorkoutPlan.objects.get(id=int(data.get("workout_id")))
                print(f"successfully got workout plan instance: {updated_workout_plan}")
                
                # Update the workout instance
                updated_workout_plan.title = data.get("workout_title")
                updated_workout_plan.description = data.get("workout_description")
                updated_workout_plan.save()

                # Clear existing exercises in the workout plan
                ExerciseInWorkoutPlan.objects.filter(workout_plan=updated_workout_plan).delete()

                # Add the new exercises
                exercises_in_plan = data.get("exercises")
                print(f"exercises_in_plan is {exercises_in_plan}")
                for exercise_data in exercises_in_plan:
                    if exercise_data.get("exerciseID") == "":
                        print(f"No exercise ID received. Continuing...")
                        continue
                    else:
                        new_exercise_in_workout_plan = ExerciseInWorkoutPlan(
                            workout_plan=updated_workout_plan,
                            sets_in_workout=exercise_data.get("exerciseSets"),
                            reps_per_set=exercise_data.get("exerciseReps"),
                            exercise=Exercise.objects.get(id=exercise_data.get("exerciseID")),
                            )
                    
                        new_exercise_in_workout_plan.save()
                        print(f"new exercise in workout plan saved: {new_exercise_in_workout_plan}")

                # Return a success HTTP response
                return JsonResponse({"message": "Workout plan successfully updated."}, status=201) 
        except Exception as e:
            print(f"error is {e}")
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=400)

    # If method is delete, delete the workout plan from the DB
    elif request.method == "DELETE":
        try:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                
                # Get the data from the request
                data = json.loads(request.body)

                # Check essential data is there
                if 'workout_plan_id' not in data:
                    return JsonResponse({"error": "Missing workout plan id."}, status=400)
                
                # Get the workout plan instance
                workout_plan_instance = WorkoutPlan.objects.get(id=data.get("workout_plan_id"))
                
                # Delete the workout plan instance
                workout_plan_instance.delete()

                # Return a success HTTP response
                return JsonResponse({"message": "Workout Plan successfully deleted."}, status=201) 
        
        except Exception as e:
            print(f"error is {e}")
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=400)
    
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
            
"""
END EXERCISES
"""

""" 
PERSONAL BESTS
"""
def personalBest(request, userID, exerciseID):
    # Check if the user is logged in, if not send to login page
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    # Security check
    userOwned(request, userID)

    if request.method == "GET":
        # grab all the user's info from the DB and return them as JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                personal_bests = PersonalBest.objects.filter(user=userID, exercise=exerciseID)
                serialized_personal_bests = serializers.serialize('json', personal_bests)
                print(f"serialized_personal_bests: {serialized_personal_bests}")
                
                return JsonResponse(serialized_personal_bests, safe=False)
            except PersonalBest.DoesNotExist:
                print(f"personal best does not exist")
                return JsonResponse({}, safe=False)
        
        #If it's not an AJAX request, render the workout plans page
        else:
            return render(request, "training/profile.html", {
                "userID": userID,
                "username": request.user.username
            })
"""
END PERSONAL BESTS
"""

"""
WORKOUTS
"""
def workouts(request, userID, workout_plan_id=None):
    # Check if the user is logged in, if not send to login page
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    # Security check
    userOwned(request, userID)

    if request.method == "GET":
        # if a specific workout plan was requested
        if workout_plan_id != None:
            # grab the workout plan info from the DB and return them as JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                workout_plan = WorkoutPlan.objects.get(id=workout_plan_id)

                serialized_workout_plan = workout_plan.serialize()

                print(f"serialized_workout_plan: {serialized_workout_plan}")
                
                return JsonResponse(serialized_workout_plan, safe=False)
            
            #If it's not an AJAX request, render the workout plans page
            else:
                return render(request, "training/workout.html", {
                    "userID": userID,
                    "username": request.user.username,
                    "workout_plan_id": workout_plan_id
                })
        # if no specific workout plan was requested, get all the user's workouts
        else:
            # grab all the user's info from the DB and return them as JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                workouts = Workout.objects.filter(user=userID)
                serialized_workouts = []
            
                for workout in workouts:
                    serialized_workouts.append(workout.serialize())
                
                print("\nSuccessfully fetched workouts\n")
                return JsonResponse(serialized_workouts, safe=False)
            
            #If it's not an AJAX request, render the workout plans page
            else:
                return render(request, "training/profile.html", {
                    "userID": userID,
                    "username": request.user.username
                })
    if request.method == "POST":
        try:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                
                # Get the data from the request
                data = json.loads(request.body)
                print(f"SAVING WORKOUT TO DB:\n\n {data}\n\n")
        
                # Check essential data is there
                if not data.get("exercises"):
                    return JsonResponse({"error": "Missing necessary fields."}, status=400)
                
                # Create the new workout
                new_workout = Workout(
                    user=User.objects.get(id=data.get("userID")),
                    workout_plan=WorkoutPlan.objects.get(id=data.get("workoutPlan")),
                    date=datetime.now(),
                )
                # Save the new workout
                new_workout.save()
                print(f"new workout saved: {new_workout}")

                exercises_in_workout = data.get("exercises")
                for exercise_data in exercises_in_workout:
                    new_exercise_in_workout = ExerciseInWorkout(
                        workout=new_workout,
                        exercise=Exercise.objects.get(id=int(exercise_data.get("exerciseID")))
                        )
                    new_exercise_in_workout.save()
                    print(f"new exercise in workout saved: {new_exercise_in_workout}")

                    for training_set in exercise_data["sets"]:
                        # convert lbs to kg so the DB only handles kg
                        if training_set.unit == "lbs":
                            set_weight = training_set.get("weight") * 0.45359237
                            set_unit = "kg" 
                        else:
                            set_weight = training_set.get("weight")
                            set_unit = "kg"
                            training_set = TrainingSet(
                                exercise=new_exercise_in_workout,
                                weight=set_weight,
                                reps=training_set.get("reps"),
                                unit=set_unit,
                            )
                        training_set.save()
                        print(f"new training set saved: {training_set}") 

                        # Check if there is a personal best for the exercise
                        if PersonalBest.objects.filter(user=new_workout.user, exercise=new_exercise_in_workout.exercise).exists():
                            # if yes, check if the weight in the set exceeds the personal best
                            # Get the PB for the exerise
                            personal_best = PersonalBest.objects.get(user=new_workout.user, exercise=new_exercise_in_workout.exercise)
                            # convert lbs to kg
                            if personal_best.unit == "lbs":
                                personal_best_weight_in_kg = personal_best.weight * 0.45359237
                            else:
                                personal_best_weight_in_kg = personal_best.weight

                            # if the weight in the set exceeds the personal best, set that as the personal best
                            if set_weight > personal_best_weight_in_kg:
                                new_personal_best = PersonalBest(
                                    user=new_workout.user,
                                    exercise=new_exercise_in_workout.exercise,
                                    weight=personal_best_weight_in_kg,
                                    reps=training_set.reps,
                                    date=datetime.now(),
                                )
                                new_personal_best.save()
                                print(f"new personal best saved: {personal_best}") 
                        else:
                            # if there is no matching personal best, then the current weight is the personal best
                            new_personal_best = PersonalBest(
                                    user=new_workout.user,
                                    exercise=new_exercise_in_workout.exercise,
                                    weight=personal_best_weight_in_kg,
                                    reps=training_set.reps,
                                    date=datetime.now(),
                                )
                # Return a success HTTP response
                return JsonResponse({"message": "Workout Plan successfully created."}, status=201) 
        
        except Exception as e:
            print(f"error is {e}")
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=400)


""" 
BODY WEIGHTS
"""
def bodyWeights(request, userID):
    
    # Check if the user is logged in, if not send to login page
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    # Security check
    userOwned(request, userID)

    if request.method == "GET":
        # grab all the user's info from the DB and return them as JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            body_weights = BodyWeight.objects.filter(user=userID)

            serialized_body_weights = []
            
            for body_weight in body_weights:
                # convert lbs to kg
                if body_weight.unit == "lbs":
                    body_weight.weight = body_weight.weight * Decimal(0.45359237)
                    body_weight.unit = "kg"
                serialized_body_weights.append(body_weight.serialize())
            
            # return the body weights
            return JsonResponse(serialized_body_weights, safe=False)
        
        #If it's not an AJAX request, render the workout plans page
        else:
            return render(request, "training/profile.html", {
                "userID": userID,
                "username": request.user.username
            })
    elif request.method == "POST":
        try:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                
                # Get the data from the request
                data = json.loads(request.body)

                # Check essential data is there
                if not data.get("weight") or not data.get("date"):
                    return JsonResponse({"error": "Missing necessary fields."}, status=400)
                
                # Create the new body weight
                new_body_weight = BodyWeight(
                    weight=data.get("weight"),
                    unit=data.get("unit"),
                    date=data.get("date"),
                    user=User.objects.get(id=data.get("user")),
                )
                # Check if a body weight for that user and date already exists 
                if BodyWeight.objects.filter(user=new_body_weight.user, date=new_body_weight.date).exists():
                    # if yes, update the existing body weight for that user on that date
                    existing_body_weight = BodyWeight.objects.get(user=new_body_weight.user, date=new_body_weight.date)
                    existing_body_weight.weight = new_body_weight.weight
                    existing_body_weight.unit = new_body_weight.unit
                    existing_body_weight.save()
                    print(f'Existing body weight updated: ', existing_body_weight)
                else:
                     # Save the new body weight
                    new_body_weight.save()
                    print('New body weight saved: ', new_body_weight)

                # Return a success HTTP response
                return JsonResponse({"message": "Body Weight successfully created."}, status=201) 
        
        except Exception as e:
            print(f"error is {e}")
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=400)

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
            return HttpResponseRedirect(reverse("profile", args=(user.id,)))
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
    
