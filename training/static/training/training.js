// -------------------------- //
// EVENT LISTENERS //
// -------------------------- //
document.addEventListener('DOMContentLoaded', function() {
    // INDEX PAGE TO DO
    // PROFILE PAGE TO DO

    // Workout plan page
    if (document.querySelector("#workout_plan-page-container")) {
        load_workout_plans(userID);
    }
});

// -------------------------- //
// WORKOUT_PLANS //
// -------------------------- //

// Fetch
function fetchWorkoutPlans(userID) {
    // fetch relevant posts from the DB based on the url
    return fetch(`/${userID}/workout_plans`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(workout_plans => {
            console.log('Fetched workout plans:', workout_plans);
            return workout_plans;
        })
        .catch(error => {
            console.error('Error fetching workout_plans:', error);
            throw error;
        });
}

// Add
function addWorkoutPlans(workout_plans) {
    // create a new div for each workout_plan
    workout_plans.forEach(workout_plan => {
        const workout_planDiv = document.createElement('div');
        workout_planDiv.className = 'section-container';
        workout_planDiv.id = `workout_plan-${workout_plan.id}`;
        workout_planDiv.onclick = () => openWorkoutPlan(workout_plan);
        
        // populate the HTML of the div
        workout_planDiv.innerHTML = `
            <div class="workout_plan-title" id="workout_plan-title-${workout_plan.id}">
                <h3>${workout_plan.title}</h3>
            </div>
            <div class="workout_plan-description" id="workout_plan-description-${workout_plan.id}"> 
                <p>${workout_plan.description}</p>
            </div>`;
        // append the new div to the DOM
        document.querySelector('#existing-workout-plans').append(workout_planDiv);
    });
}

// Open full workout plan
function openWorkoutPlan(workout_plan) {
    // Fetch the clicked workout plan's div
    const workout_planDiv = document.getElementById(`workout_plan-${workout_plan.id}`);
    
    // If the workout plan is already open, close it
    const details_already_loaded = document.getElementById(`workout_plan-details-${workout_plan.id}`);
    if (details_already_loaded) {
        details_already_loaded.remove();
        return;
    }

    // Create a bulleted list of the exercises in the workout plan
    const exercise_list = workout_plan.exercises_in_plan;
    const list_items = exercise_list.map(exercise_detail => `
        <li>
            <strong>${exercise_detail.name}:</strong> ${exercise_detail.sets_in_workout} sets of ${exercise_detail.reps_per_set} reps
        </li>
    `).join('');
    
    // create a new div to house the exercise list
    const workout_plan_detailsDiv = document.createElement('div');
    workout_plan_detailsDiv.className = 'workout_plan-details';
    workout_plan_detailsDiv.id = `workout_plan-details-${workout_plan.id}`;
    workout_plan_detailsDiv.innerHTML = `
        <ul>
            ${list_items}
        </ul>
    `;
    // add the new div to the workout plan div
    workout_planDiv.append(workout_plan_detailsDiv);

    // TO DO: ADD A BUTTON TO CLOSE THE WORKOUT
    // TO DO: ADD A BUTTON TO START THE WORKOUT
}

// Load
function load_workout_plans(userID) {
    fetchWorkoutPlans(userID)
        .then(addWorkoutPlans)
        .catch(error => {
            console.error('Error loading workout_plans:', error);
            throw error;
        });
}
