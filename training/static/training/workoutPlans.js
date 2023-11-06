// -------------------------- //
// IMPORTS                    //
// -------------------------- //

import { open_create_workout_plan_form } from './training.js';
import { start_workout } from './workouts.js';

// -------------------------- //
// EVENT LISTENERS            //
// -------------------------- //


// -------------------------- //
// CONSTANTS                  //
// -------------------------- //

// Global variable for workout plans fetched from the DB
// So we only need to call once
let fetchedWorkoutPlans =[];

// -------------------------- //
// Fetch workout plans        //
// -------------------------- //

// Fetch
function fetchWorkoutPlans(userID) {
    // fetch relevant posts from the DB based on the url
    return fetch(`/${userID}/workout_plans`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(workout_plans => {
            fetchedWorkoutPlans = workout_plans;
            return workout_plans;
        })
        .catch(error => {
            console.error('Error fetching workout_plans:', error);
            throw error;
        });
}

// ---------------------------------------------- //
// Create and add workout plan items on the DOM   //
// ---------------------------------------------- //

// Create and add workout plans to DOM
function addWorkoutPlans(workout_plans) {
    // create a new div for each workout_plan
    workout_plans.forEach(workout_plan => {
        const workout_planDiv = document.createElement('div');
        workout_planDiv.className = 'section-container workout-plan-container entering';
        workout_planDiv.id = `workout-plan-container-${workout_plan.id}`;
        workout_planDiv.onclick = () => openWorkoutPlan(workout_plan);
        
        // populate the HTML of the div
        workout_planDiv.innerHTML = `
            <div class="section-title" id="workout_plan-title-${workout_plan.id}">
                <h4>${workout_plan.title}</h4>
                <div class="dropdown-arrow">▼</div>
            </div>`;
        // append the new div to the DOM
        document.querySelector('#existing-workout-plans').append(workout_planDiv);

        // add an event listener for the animation end
        workout_planDiv.addEventListener('animationend', function() {
            workout_planDiv.classList.remove('entering');
        });
    });
}

// Create and add create workout plan action to the DOM
function addCreateWorkoutPlanAction() {
    // create a new div for the create workout plan action
    const create_workout_plan_action = document.createElement('div');
    create_workout_plan_action.className = 'section-container workout-plan-container action entering';
    create_workout_plan_action.id = 'create-workout-plan-action';
    create_workout_plan_action.onclick = () => open_create_workout_plan_form();
    create_workout_plan_action.innerHTML = `
        <h4>
            Create Workout Plan
        </h4>
    `;
    // append it to the DOM
    document.querySelector('#main-page-action').appendChild(create_workout_plan_action);

    // add event listener to remove animation class
    create_workout_plan_action.addEventListener('animationend', function() {
        create_workout_plan_action.classList.remove('entering');
    });
}

// Open full workout plan
function openWorkoutPlan(workout_plan) {
    // Fetch the clicked workout plan's div
    const workout_planDiv = document.getElementById(`workout-plan-container-${workout_plan.id}`);
    
    // If the workout plan is already open, close it
    const details_already_loaded = document.getElementById(`workout_plan-details-${workout_plan.id}`);
    if (details_already_loaded) {
        details_already_loaded.remove();
        workout_planDiv.classList.remove('expand');
        workout_planDiv.classList.add('contract');
        // on animation end, remove the closed class
        workout_planDiv.addEventListener('animationend', function() {
            workout_planDiv.classList.remove('contract');
        });
        return;
    } else {
        workout_planDiv.classList.add('expand');
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
        <div class="section-description" id="workout_plan-description-${workout_plan.id}"> 
            <p>${workout_plan.description}</p>
        </div>    
        <div class="exercise-list" id="workout_plan-exercise-list-${workout_plan.id}">
        <ul>
            ${list_items}
        </ul>
        </div>
    `;
    // add the new div to the workout plan div
    workout_planDiv.append(workout_plan_detailsDiv);

    // create a new Div to house edit / delete workout plans
    const workout_plan_actionsDiv = document.createElement('div');
    workout_plan_actionsDiv.className = 'action-buttons-container';
    workout_plan_actionsDiv.id = `workout-plan-actions-${workout_plan.id}`;
    workout_plan_actionsDiv.innerHTML = `  
                <button type="button" class="action-button-outline" id="edit-workout-plan-${workout_plan.id}">Edit Plan</button>
                <button type="button" class="action-button-outline" id="delete-workout-plan-${workout_plan.id}">Delete Plan</button>
    `;
    // add the new div to the workout plan div
    workout_plan_detailsDiv.append(workout_plan_actionsDiv);

    // add event listeners to the edit and delete buttons
    const editPlanBtn = document.getElementById('edit-workout-plan');
    if (editPlanBtn) {
        editPlanBtn.addEventListener('click', add_exercise_to_form);
    }

    const deletePlanBtn = document.getElementById(`delete-workout-plan-${workout_plan.id}`);
    if (deletePlanBtn) {
        deletePlanBtn.addEventListener('click', () => delete_plan(workout_plan.id));
    }

    // add a start workout button
    const start_workout_action = document.createElement('div');
    start_workout_action.className = 'section-container action';
    start_workout_action.id = `start-workout-action-${workout_plan.id}`;
    start_workout_action.role = 'button';
    start_workout_action.onclick = () => start_workout(workout_plan.id);
    start_workout_action.innerHTML = `
        <h4>Start Workout</h4>`;
    // add the start workout button to the workout plan div
    workout_plan_detailsDiv.append(start_workout_action);
}


// -------------------------- //
// Load workout plans         //
// -------------------------- //

// Load workout plans page
async function load_workout_plans(userID) {
    try {
        await fetchWorkoutPlans(userID);
        addWorkoutPlans(fetchedWorkoutPlans);
        addCreateWorkoutPlanAction();
    } catch (error) {
        console.error('Error loading workout_plans:', error);
    }
}
// ----------- //
// Delete plan //
// ----------- //

// Actual delete workout plan
function delete_plan(workout_plan_id) {
    // Get the CSRF token from the meta tag
    const csrf_token = document.querySelector('meta[name="csrf_token"]').getAttribute('content');
    
    // fetch relevant posts from the DB based on the url
    fetch(`../workout_plans`, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrf_token, 
        },
        body: JSON.stringify({ 'workout_plan_id': workout_plan_id }),
        })

        .then(response => response.json())
        .then(result => {
            console.log(result);
            // remove the workout plan from the DOM
            document.getElementById(`workout-plan-container-${workout_plan_id}`).remove();
        })
        .catch(error => {
            console.error('Error deleting workout plan:', error);
            throw error;
        });

}

    
// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { load_workout_plans };
