// -------------------------- //
// IMPORTS                    //
// -------------------------- //

import { open_create_workout_plan_form, add_exercise_to_form, submit_plan, save_workout_plan } from './training.js';
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
            Create New Plan
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
    const editPlanBtn = document.getElementById(`edit-workout-plan-${workout_plan.id}`);
    if (editPlanBtn) {
        editPlanBtn.addEventListener('click', () => edit_workout_plan(workout_plan.id));
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

// Delete workout plan
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

// ----------//
// Edit plan //
// --------- //

// Edit workout plan
async function edit_workout_plan(workout_plan_id) {
    // Get the workout plan's info from the global variable
    const workout_plan = fetchedWorkoutPlans.find(workout_plan => workout_plan.id === workout_plan_id); 

    // Open the create workout plan form
    await open_create_workout_plan_form();

    // Prepopulate it with all the workout plan information
    document.getElementById('create_workout_plan_form_title').innerHTML = '<h3>Edit Workout Plan</h3>';
    document.getElementById('new-workout-plan-title').value = workout_plan.title;
    document.getElementById('new-workout-plan-description').value = workout_plan.description;
    
    // Open the number of exercise rows needed
    const num_exercises = workout_plan.exercises_in_plan.length;
    
    await add_exercise_rows(num_exercises);

    // change the Save Plan button to an Update Plan button
    await document.getElementById('new-workout-plan-save').removeEventListener('click', submit_plan);
    document.getElementById('new-workout-plan-save').id = 'update-workout-plan-save';
    const update_workout_plan_button = document.getElementById('update-workout-plan-save');
    update_workout_plan_button.innerHTML = '<h4>Update Plan</h4>';
    if (update_workout_plan_button) {
        update_workout_plan_button.removeEventListener('click', () => update_workout_plan(workout_plan_id, num_exercises));
        update_workout_plan_button.addEventListener('click', () => update_workout_plan(workout_plan_id, num_exercises));
    };

    // Populate the exercise rows with the correct information
    for (let i = 1; i <= num_exercises; i++) {
        const exercise_row = document.getElementById(`new-exercise-${i}`);
        const exerciseNameDropdown = document.getElementById(`new-exercise-name-${i}`);
        const exerciseSetsInput = document.getElementById(`new-exercise-sets-${i}`);
        const exerciseRepsInput = document.getElementById(`new-exercise-reps-${i}`);
        // Set the value for the dropdown
        Array.from(exerciseNameDropdown.options).forEach(option => {
            if (option.textContent === workout_plan.exercises_in_plan[i - 1].name) {
                option.selected = true;
                }
        });
    
        // Set values for sets and reps inputs
        exerciseSetsInput.value = workout_plan.exercises_in_plan[i - 1].sets_in_workout;
        exerciseRepsInput.value = workout_plan.exercises_in_plan[i - 1].reps_per_set;
    }

}

// ------------------------------ //
// Add exercise rows in edit form //
// ------------------------------ //

async function add_exercise_rows(num_exercises) {
    // set i to 1 because the first row is already open
    for (let i = 1; i < num_exercises; i++) {
        await add_exercise_to_form();
    }
}

// -------------------------- //
// Update workout plan        //
// -------------------------- //

// this is not done up front so as to avoid needing to change the add and remove exercise button logic

async function update_workout_plan(workout_plan_id, num_exercises) {

    // change the div Ids to 'edit' not new so we can submit the form correctly
    document.getElementById('new-workout-plan-title').id = 'edit-workout-plan-title';
    document.getElementById('new-workout-plan-description').id = 'edit-workout-plan-description';

    // loop through exercise rows and update each of the div IDs
    for (let i = 1; i <= num_exercises; i++) {
        document.getElementById(`new-exercise-${i}`).id = `edit-exercise-${i}`;
        document.getElementById(`new-exercise-name-${i}`).id = `edit-exercise-name-${i}`;
        document.getElementById(`new-exercise-sets-${i}`).id = `edit-exercise-sets-${i}`;
        document.getElementById(`new-exercise-reps-${i}`).id = `edit-exercise-reps-${i}`;
    }

    // submit the form
    await submit_updated_plan(workout_plan_id, num_exercises);

    // reset the form
    reset_create_workout_plan_form();
}

// -------------------------- //
// Submit updated plan //
// -------------------------- //

function submit_updated_plan(workout_plan_id, num_exercises) {
    let planDetails = {
        "id" : workout_plan_id,
        "title" : document.getElementById('edit-workout-plan-title').value,
        "description" : document.getElementById('edit-workout-plan-description').value,
    };
    let exercises = [];
    // loop through exercise rows and create an array for each exercise
    for (let i = 1; i <= num_exercises; i++){
        let exercise = {
            "exerciseName" : document.getElementById(`edit-exercise-name-${i}`).value,
            "exerciseSets" : document.getElementById(`edit-exercise-sets-${i}`).value,
            "exerciseReps" : document.getElementById(`edit-exercise-reps-${i}`).value
    }
        exercises.push(exercise);
    planDetails.exercises = exercises;
    console.log("plan details: ", planDetails);
    save_workout_plan(planDetails);
    }
}

// -------------------------- //
// Submit updated plan to DB  //
// -------------------------- //

function save_updated_plan(planDetails) {
    console.log('updating workout plan');

}

// -------------------------- //
// Reset create workout plan form //
// -------------------------- //

// turns all the div IDs back to new from edit
// and sets the button back to save plan
// and clears the form

function reset_create_workout_plan_form() {
    // turn all div IDs back to new from edit
    document.getElementById('edit-workout-plan-title').id = 'new-workout-plan-title';
    document.getElementById('edit-workout-plan-description').id = 'new-workout-plan-description';

    // loop through exercise rows and update each of the div IDs
    for (let i = 1; i <= num_exercises; i++) {
        document.getElementById(`edit-exercise-${i}`).id = `new-exercise-${i}`;
        document.getElementById(`edit-exercise-name-${i}`).id = `new-exercise-name-${i}`;
        document.getElementById(`edit-exercise-sets-${i}`).id = `new-exercise-sets-${i}`;
        document.getElementById(`edit-exercise-reps-${i}`).id = `new-exercise-reps-${i}`;
    }

    // change the Update Plan button back to Save Plan
    document.getElementById('update-workout-plan-save').removeEventListener('click', update_workout_plan);
    document.getElementById('update-workout-plan-save').id = 'new-workout-plan-save';
    const save_workout_plan_button = document.getElementById('new-workout-plan-save');
    save_workout_plan_button.innerHTML = '<h4>Save Plan</h4>';
    if (save_workout_plan_button) {
        save_workout_plan_button.removeEventListener('click', () => submit_plan());
        save_workout_plan_button.addEventListener('click', () => submit_plan());
    };

}

// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { load_workout_plans };
