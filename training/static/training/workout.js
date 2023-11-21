//---------------//
// IMPORTS       //
//---------------//

// -------------------------- //
// EVENT LISTENERS //
// -------------------------- //
document.addEventListener('DOMContentLoaded', function() {
    // Workout page
    if (document.querySelector("#workout-page-container")) {
        loadWorkout(workout_plan_id);
    }
});

//---------------//
// CONSTANTS     //
//---------------//

//--------------------//
// Fetch workout plan //
//--------------------//

function fetchWorkoutPlan(workout_plan_id) {
    return fetch(`/${userID}/workouts/${workout_plan_id}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(workout_plan => {
            return workout_plan;
        })
        .catch(error => {
            console.error('Error fetching workout plan:', error);
            throw error;
        });
}

//----------------//
// CREATE WORKOUT //
//----------------//

// puts the workout onto the page
function createWorkout(workout_plan) {

    console.log('workout_plan: ', workout_plan)

    // put in the title of the page
    document.querySelector('#workout-page-title').innerHTML=`
                                                        <h2>${workout_plan.title}</h2>
                                                        `

    // Divs to hold the details of the exercises in the workout
    // loops through the exercises and creates a div for each
    workout_plan.exercises_in_plan.forEach(exercise =>{
        // Set up the section div for the exercise
        const exerciseDiv = document.createElement('div')
        exerciseDiv.className="section-container entering"
        exerciseDiv.id = `exercise-${exercise.id}-in-workout-${workout_plan.id}`

        // div for exercise name
        const exerciseNameDiv = document.createElement('div')
        exerciseNameDiv.className = `section-title`
        exerciseNameDiv.id = `exercise-in-workout-name-${exercise.id}`
        exerciseNameDiv.innerHTML=`
                                    <h4>${exercise.name}</h4>
                                    <div class="dropdown-arrow">▼</div>
                                    `
        // div for sets and reps count
        const exerciseSetsAndRepsCount = document.createElement('div')
        exerciseSetsAndRepsCount.className = 'sets-and-reps-count'
        exerciseSetsAndRepsCount.id = `sets-and-reps-count-${exercise.id}`
        exerciseSetsAndRepsCount.innerHTML =`
                                            <p>${exercise.sets_in_workout} x ${exercise.reps_per_set} reps </p>
                                            `
        // div for expanded exercise information
        const exerciseInfoExpanded = document.createElement('div')
        exerciseInfoExpanded.className = 'expanded-exercise'
        exerciseInfoExpanded.id = `expanded-exercise-${exercise.id}`
        
        // div for exercise description
        const exerciseDescriptionDiv = document.createElement('div')
        exerciseDescriptionDiv.className = `exercise-in-workout-description`
        exerciseDescriptionDiv.id = `exercise-in-workout-description-${exercise.id}`
        
        // most plans won't have a description so need to handle gracefully
        let exerciseDescription = '';
        if (!exercise.description) {
            // Assign an empty string if description is not available
            exerciseDescription = 'DESCRIPTION GOES HERE';
        } else {
            // Assign the actual description if available
            exerciseDescription = exercise.description;
        }
        exerciseDescriptionDiv.innerHTML=`
                                         <p>${exerciseDescription}</p>
                                         `

        // divs for sets
        for (let i = 1; i <= exercise.sets_in_workout; i++){
            const exerciseDiv = document.createElement('div')
            exerciseDiv.className = 'form-group'
            exerciseDiv.id=`exercise-in-workout-${exercise.id}`
            exerciseDiv.innerHTML=`
                                <hr>
                                <div class="form-row">
                                    <strong> Set ${i} </strong>
                                </div>
                               `
            // add the exercise info to the expanded exercise div
            exerciseInfoExpanded.appendChild(exerciseDiv)
        }

        // TO DO divs for edit exercises actions

        // TO DO div for End Workout action

        // Finished assembling expanded exercise div
        exerciseInfoExpanded.insertBefore(exerciseDescriptionDiv,exerciseInfoExpanded.firstChild)

        // Assemble the exerciseDiv
        exerciseDiv.appendChild(exerciseNameDiv)
        exerciseDiv.appendChild(exerciseSetsAndRepsCount)
        exerciseDiv.appendChild(exerciseInfoExpanded)
        

        // Add the final div to the DOM
        document.querySelector("#workout-plan").append(exerciseDiv);
    });

    // Add the end workout button
    document.querySelector('#main-page-action').appendChild(endWorkoutButton())

}

// -------------------------- //
// End workout button         //
// -------------------------- //

function endWorkoutButton() {
    const end_workout_action = document.createElement('div');
    end_workout_action.className = 'section-container action';
    end_workout_action.id = 'end-workout-action'
    end_workout_action.onclick = () => end_workout(workout_plan_id)
    end_workout_action.innerHTML=`
                                <h4>End Workout</h4>
                                `
    return end_workout_action
}

function end_workout(workout_plan_id){
    console.log('end workout button pressed');
}


// -------------------------- //
// LOAD WORKOUT //  
// -------------------------- //

async function loadWorkout(workout_plan_id) {
    try {
        var workout_plan = await fetchWorkoutPlan(workout_plan_id);
        createWorkout(workout_plan);
    } catch (error) {
        console.error('Error loading workout plan: ', error);
    }
}

//---------------//
// Start workout //
//---------------//

// Called when Start Workout button is clicked on the workout plan page
function start_workout(workout_plan_id) {
    window.location.href = `/${userID}/workouts/${workout_plan_id}`;
}


//---------------//
// EXPORTS       //
//---------------//

export { start_workout };
