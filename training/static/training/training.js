// -------------------------- //
// Imports                    //
// -------------------------- //

import { load_workout_plans } from "./workoutPlans.js";

// -------------------------- //
// EVENT LISTENERS //
// -------------------------- //
document.addEventListener('DOMContentLoaded', function() {

    // Workout plan page
    if (document.querySelector("#workout_plan-page-container")) {
        load_workout_plans(userID);
    }
    // Workout page
    if (document.querySelector("#workout-page-container")) {
        // ADD FUNCTION
    }
});


// -------------------------- //
// Helping functions for create workout plan //
// -------------------------- //

// Global variable for exercises fetched from the DB
let fetchedExercises = [];

// Global variable for exercise number so exercise rows can be uniquely identified
let exercise_number = 1;

// last selected dropdown menu for adding new exercise to
let lastSelectedDropdown = '';

// Hide a section
function hide_section(section) {
    return new Promise(resolve => {
        section.classList.add('exiting');
        
        // Listener for end of animation
        function animationEndCallback() {
            section.classList.remove('exiting');
            section.style.display = 'none';
            section.removeEventListener('animationend', animationEndCallback);
            resolve();
        }
        
        section.addEventListener('animationend', animationEndCallback);
    });
}

// Show a section container
function show_section(section) {
    section.style.display = 'block';
    section.classList.add('entering');
    
    // add listener for end of animation
    section.addEventListener('animationend', function animationEndCallback() {
        section.classList.remove('entering');
        section.removeEventListener('animationend', animationEndCallback);
    });
}




















// -------------------------- //
// CREATE WORKOUT PLAN FORM   //
// STARTS HERE                //
// -------------------------- //

// -------------------------- //
// CLOSE FORMS                //
// -------------------------- //

// CLOSE THE CREATE WORKOUT PLAN FORM
async function close_create_workout_plan_form() {
    let workout_plan_form = document.getElementById('create-workout-plan-form-container');
    await hide_section(workout_plan_form);

    // reload page
    window.location.reload();
}

// CLOSE THE EXERCISE FORM

// Button action for closing the exercise form without saving
async function closeExerciseForm() {
    let exerciseForm = document.getElementById('create-exercise-form-container');
    await hide_section(exerciseForm);

    // THIS SHOULDN'T LIVE HERE
    // Show the create_workout_plan form again
    let createWorkoutPlanForm = document.getElementById('create-workout-plan-form-container'); 
    show_section(createWorkoutPlanForm);
}

// ------------------------------ //
// EXERCISES IN WORKOUT PLAN FORM //
// ------------------------------ //

// CREATE DROPDOWN MENU OF EXERCISES //

// Generate a dropdown menu of the user's exercises, using the fetched exercises
function generate_exercise_dropdown() {
    // Sort exercises alphabetically by exercise name
    fetchedExercises.sort((a, b) => a.name.localeCompare(b.name));

    let dropdown = `
        <div class="form-group col-md-6">
            <label>Exercise</label>
            <select class="form-control" id="new-exercise-name-${exercise_number}">
            <option value="" disabled selected>Select exercise from list</option>
            `;
    
    fetchedExercises.forEach(exercise => {
        dropdown += `<option value="${exercise.id}">${exercise.name}</option>`;
    });

    dropdown += `
            <option value="" disabled>_______</option>
            <option value="add-new-exercise">Add new exercise</option>
            </select>
        </div>
    `;

    return dropdown;
}

// GENERATE HTML FOR A NEW EXERCISE ROW //

// Create a row in the form for each exercise
function generate_exercise_row() {
    const exerciseDropdown = generate_exercise_dropdown();
    const row = `
        <div id="new-exercise-${exercise_number}">
            <hr>
            <div class="form-row" id="new-exercise-row-${exercise_number}">
                ${exerciseDropdown}
                <div class="form-group col-md-3">
                    <label>Sets</label>
                    <input type="number" class="form-control" id="new-exercise-sets-${exercise_number}" min="1" step="1" placeholder="Number of sets">  
                </div>
                <div class="form-group col-md-3">
                    <label>Reps</label>
                    <input type="number" class="form-control" id="new-exercise-reps-${exercise_number}" min="1" step="1" placeholder="Number of reps per set">
                </div>
            </div>
        </div>
    `;

    exercise_number += 1;
    
    return row;
}

// ADD AN EXERCISE

// Adds a new exercise to the create workout plan form
function add_exercise_to_form() {
    const newRow = generate_exercise_row();
    // add the new form row to the DOM
    document.getElementById('new-exercises').insertAdjacentHTML('beforeend', newRow);
}

// REMOVE AN EXERCISE

// Removes an exercise from the plan form
function remove_exercise_from_form() {
    console.log('removing exercise from form')
    // check if there is more than one exercise row
    if (exercise_number > 2) {
        // remove the last exercise row from the DOM
        document.getElementById(`new-exercise-${exercise_number - 1}`).remove();
        exercise_number -= 1;
    }
}

// FETCH EXERCISES FROM DB // 

// Get user's exercises from the DB so we can populate into form
function fetch_user_exercises(userID) {
    return fetch(`/${userID}/exercises`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(exercises => {
            // store the fetched exercises in the global variable
            fetchedExercises = exercises;
            return exercises;
        })
        .catch(error => {
            console.error('Error fetching exercises:', error);
            throw error;
        });
}

// -------------------------- //
// SUBMIT AND SAVE WORKOUT PLAN FORM //
// -------------------------- //

// SUBMIT THE WORKOUT PLAN FORM //

function submit_plan() {
    console.log('submit plan is called')
    let planDetails = {
        "title" : document.getElementById('new-workout-plan-title').value,
        "description" : document.getElementById('new-workout-plan-description').value,
    };
    let exercises = [];
    // loop through exercise rows and create an array for each exercise
    for (let i = 1; i < exercise_number; i++){
        let exerciseDropdown = document.getElementById(`new-exercise-name-${i}`);
        let selectedOptionText = exerciseDropdown.options[exerciseDropdown.selectedIndex].text;
        let exercise = {
            "exerciseID": exerciseDropdown.value,
            "exerciseName": selectedOptionText,
            "exerciseSets": document.getElementById(`new-exercise-sets-${i}`).value,
            "exerciseReps": document.getElementById(`new-exercise-reps-${i}`).value
            }
        exercises.push(exercise);
        planDetails.exercises = exercises;
        }
    save_workout_plan(planDetails);
}

// SAVE THE NEW WORKOUT PLAN TO THE DB
function save_workout_plan(plan) {
    // Create the new workout plan object
    const newWorkoutPlan = {
        "title": plan.title,
        "description": plan.description,
        "user_id": userID,
        "exercises_in_plan": plan.exercises,
    }

    console.log('new workout plan: ', newWorkoutPlan);

    // Get the CSRF token from the meta tag
    const csrf_token = document.querySelector('meta[name="csrf_token"]').getAttribute('content');

    // POST the new workout plan to the DB
    fetch(`/${userID}/workout_plans/`, {
        method: 'POST',
        body: JSON.stringify(newWorkoutPlan),
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrf_token,
        }
    }) // closing bracket for fetch was moved to here
    .then(_ => {
        // Reload page with new workout plan
        //window.location.reload();
    })
    .catch(error => {
        console.error('Error submitting new workout plan to DB:', error);
        throw error;
    });
}


// -------------------------- //
// OPEN THE CREATE WORKOUT PLAN FORM //
// -------------------------- //   

// Main function for creating a new workout plan //
async function open_create_workout_plan_form() {

    // hide all the workout plans and the create workout button
    let promises=[];
    let createWorkoutPlanAction = document.getElementById('create-workout-plan-action');
    let workoutPlans = document.querySelectorAll('.workout-plan-container');
    workoutPlans.forEach(workoutPlan => {
        promises.push(hide_section(workoutPlan));
        });
    promises.push(hide_section(createWorkoutPlanAction))

    // wait for all the promises to resolve
    await Promise.all(promises);
    
    // check if fetchedExercises has any items in it
    // if not, the DB hasn't been called so we call it
    if (!fetchedExercises.length) {
        try {
            await fetch_user_exercises(userID);
        } catch (error) {
            console.error('Failed to fetch user exercises:', error);
            return;
        }
    }
    // Check if the section container already exists
    // If yes, show it
    let workout_plan_form = document.getElementById('create-workout-plan-form-container');
    if (workout_plan_form) {
        show_section(workout_plan_form);
        return;
    }
    // if no, create it
    else {
        // create section container for the form
        const form_container = document.createElement('div');
        form_container.className = 'section-container entering';
        form_container.id = 'create-workout-plan-form-container';
        form_container.innerHTML = `
            <div class="section-title" id="create_workout_plan_form_title">
                <h3>New Workout Plan</h3>
                <a class="close-section" id="close_create_workout_plan_form"><strong>Ｘ</strong></a>
            </div>`

        // create the form
        const form = document.createElement('form');
        form.id = 'create-workout-plan-form';
        form.innerHTML = `
            <div class="form-group">
                <label>Plan Title</label>
                <input type="text" class="form-control" id="new-workout-plan-title" required placeholder="New workout plan title">
                <small id="title-help" class="form-text text-muted">Choose a title that will help you find this workout again from a list.</small>
            </div>
            <div class="form-group">
                <label>Plan Description</label>
                <input type="textarea" class="form-control" id="new-workout-plan-description" placeholder="Plan description">
            </div>
            <div class="form-exercises" id="new-exercises">
                ${generate_exercise_row()}
            </div>
            <div class="action-buttons-container" id="new-workout-plan-actions">    
                <button type="button" class="action-button-outline" id="add-exercise-button" >Add Exercise</button>
                <button type="button" class="action-button-outline" id="remove-exercise-button">Remove Exercise</button>
            </div>
            <div class="section-container action" id="new-workout-plan-save" role="button">
                <h4>Save Plan</h4>
            </div>
        `;

        // add the form to the DOM
        document.getElementById('create-workout-plan').append(form_container);
        document.getElementById('create-workout-plan-form-container').append(form);

        // add an event listener for the animation end
        form_container.addEventListener('animationend', function animationEndCallback() {
            form_container.classList.remove('entering');
            form_container.removeEventListener('animationend', animationEndCallback);
        });

        // Set focus to the "Plan Title" input field
        document.getElementById('new-workout-plan-title').focus();

        // Add event listener for adding exercise
        const addExerciseToFormBtn = document.getElementById('add-exercise-button');
        if (addExerciseToFormBtn) {
            addExerciseToFormBtn.addEventListener('click', add_exercise_to_form);
        }

        // Add event listener for removing exercise
        const removeExerciseFromFormBtn = document.getElementById('remove-exercise-button');
        if (removeExerciseFromFormBtn) {
            removeExerciseFromFormBtn.addEventListener('click', remove_exercise_from_form);
        }

        // add event listener for if use selects add new exercise in dropdown
        document.getElementById('new-exercises').addEventListener('change', function(event) {
            if(event.target.id.startsWith('new-exercise-name') && event.target.value === 'add-new-exercise') {
                lastSelectedDropdown = event.target;
                create_new_exercise_form();
            }
        });
        
        // Add event listener for the close button
        const closeCreateWorkoutFormBtn = document.getElementById('close_create_workout_plan_form');
        if (closeCreateWorkoutFormBtn) {
            closeCreateWorkoutFormBtn.addEventListener('click', close_create_workout_plan_form);
        }

        // Add event listener for the submit button
        const submitWorkoutPlanBtn = document.getElementById('new-workout-plan-save');
        if (submitWorkoutPlanBtn) {
            console.log('event listener for submit plan is called')
            submitWorkoutPlanBtn.removeEventListener('click', submit_plan);
            submitWorkoutPlanBtn.addEventListener('click', submit_plan);
        }
    }
}







































// -------------------------- //
// CREATE EXERCISE FORM       //
// STARTS HERE                //
// -------------------------- //

// OPEN THE NEW EXERCISE FORM

// Create a new exercise form
async function create_new_exercise_form() {
    // hide each of the workout plan containers if they are open
    let workoutPlans = document.querySelectorAll('.workout-plan-container');
    workoutPlans.forEach(workoutPlan => {
        hide_section(workoutPlan);
    });

    // hide the create new workout plan form if it is open
    let workout_plan_form = document.getElementById('create-workout-plan-form-container');
    if (workout_plan_form) {
        await hide_section(workout_plan_form);
    }

    // Create the new exercise form
    const form_container = document.createElement('div');
    form_container.className = 'section-container entering';
    form_container.id = 'create-exercise-form-container';
    form_container.innerHTML = `
        <div class="section-title" id="create_exercise_form_title">
            <h3>New Exercise</h3>
            <div class="close-section" id="close_create_exercise_form"><strong>Ｘ</strong></div>
        </div>
        <form id="create-exercise-form">
            <div class="form-group">
                <label>Exercise Name</label>
                <input type="text" class="form-control" id="new-exercise-name" placeholder="Exercise name">
            </div>
            <div class="form-group">
                <label>Exercise Description</label>
                <textarea class="form-control" id="new-exercise-description" placeholder="Exercise description"></textarea>
            </div>
            <div class="section-container action" id="new-exercise-save" role="button">
                <h4>Save Exercise</h4>
            </div>
                
        </form>
    `;

    // Add the form to the DOM
    document.getElementById('add-exercise').appendChild(form_container);
    
    setTimeout(() => {
        // Set focus to the "Exercise Name" input field
        const newExerciseNameInput = document.getElementById('new-exercise-name');
        if (newExerciseNameInput) {
            newExerciseNameInput.focus();
        }
    }, 0);

    // Add an event listener for the animation end
    form_container.addEventListener('animationend', function animationEndCallback() {
        form_container.classList.remove('entering');
        form_container.removeEventListener('animationend', animationEndCallback);
    });

    // Add event listener for the close button
    const closeExerciseFormBtn = document.getElementById('close_create_exercise_form');
    if (closeExerciseFormBtn) {
        closeExerciseFormBtn.addEventListener('click', closeExerciseForm);
    }

    // Add event listener for saving the new exercise
    const saveNewExerciseBtn = document.getElementById('new-exercise-save');
    if (saveNewExerciseBtn) {
        saveNewExerciseBtn.addEventListener('click', save_new_exercise);
    }
}

// SAVE THE EXERCISE FORM DATA IN THE DB

// Save the new exercise 
function save_new_exercise() {
    // Get the new exercise data from the form
    const exerciseName = document.getElementById('new-exercise-name').value;
    const exerciseDescription = document.getElementById('new-exercise-description').value;

    // Create the new exercise object
    const newExercise = {
        "name": exerciseName,
        "description": exerciseDescription,
        "user_id": userID
    }

    // Check the user has not entered a blank exercise name
    if (!newExercise.name || newExercise.name.trim() === '') {
        alert('Exercise name cannot be blank');
        return;
    }

    // Check the user has not entered 'Add new exercise' as the exercise name
    if (newExercise.name.toLowerCase() === 'add new exercise') {
        alert('Cannot add "Add new exercise" as an exercise name');
        return;
    }

    // Check the user hasn't added an exercise that already exists
    let existingExercise = fetchedExercises.find(exercise => exercise.name.toLowerCase() === newExercise.name.toLowerCase());
    if (existingExercise) {
        alert('Exercise already exists');
        return;
    }

    // Get the CSRF token from the meta tag
    const csrf_token = document.querySelector('meta[name="csrf_token"]').getAttribute('content');

    // POST the new exercise to the DB
    fetch(`/${userID}/exercises/`, {
        method: 'POST',
        body: JSON.stringify(newExercise),
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrf_token,
        }
    })
        .catch(error => {
            console.error('Error submitting new exercise to DB:', error);
            throw error;
        })

    // Add the new exercise to the global variable
    fetchedExercises.push(newExercise);

    // Call the update front end function
    update_exercises_front_end(newExercise);
}

// UPDATE THE FRONT END WITH NEW EXERCISE INFO WITHOUT PAGE RELOAD

// Update the front end with the new exercise
function update_exercises_front_end(newExercise) {

    // Grab all the current entries before we regenerate the dropdown menus
    let currentEntries = [];
    let dropdowns = document.querySelectorAll('select[id^="new-exercise-name"]');
    dropdowns.forEach(dropdown => {
        currentEntries.push(dropdown.value);
    });
    
    // Clear all the dropdown menus
    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = '';
    });

    // Regenerate the dropdown menus
    const exerciseDropdown = generate_exercise_dropdown();

    // Add the newly generated dropdown menus to the DOM
    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = exerciseDropdown;
    });

    // Remove the new exercise form
    let createExerciseForm = document.getElementById('create-exercise-form-container');
    hide_section(createExerciseForm);
    // and remove it so that it is created fresh next time.
    createExerciseForm.remove();

    // Add the previously entered entries back into the dropdown menus
    dropdowns.forEach((dropdown, index) => {
        let currentEntry = currentEntries[index];
        let options = dropdown.options;
        for(let j = 0; j < options.length; j++) {
            if(options[j].value === currentEntry) {
                dropdown.value = options[j].value;
                break;
            }
        }
    });

    // Update the selection in the last selected dropdown menu to the newly created exercise
    let options = lastSelectedDropdown.options;
    for(let i = 0; i < options.length; i++) {
        if(options[i].text === newExercise.name) {
            options[i].selected=true;
            break;
        }
    }

    // Set focus to the last selected dropdown menu
    lastSelectedDropdown.focus();

    // reshow the create workout plan form
    let createWorkoutPlanForm = document.getElementById('create-workout-plan-form-container');
    show_section(createWorkoutPlanForm);
}


// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { open_create_workout_plan_form, add_exercise_to_form, submit_plan, save_workout_plan };





