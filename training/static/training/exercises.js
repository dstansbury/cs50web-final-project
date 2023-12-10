// -------------------------- //
// IMPORTS                    //
// -------------------------- //

import { show_section, hide_section } from "./training.js";
import { create_exercise_in_workout, addExpandListener, removeEntering, hideFirstMoveUpButton } from "./workout.js";
import { load_workout_plans } from "./workoutPlans.js";

// -------------------------- //
// GLOBAL VARIABLES           //
// -------------------------- //

let fetchedExercises = [];

// -------------------------- //
// FUNCTIONS                  //
// -------------------------- //

// -------------------------- //
// Get User Exercises from DB //
// -------------------------- //

function fetchUserExercises(userID) {
    return fetch(`/${userID}/exercises`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(exercises => {
            return exercises;
        })
        .catch(error => {
            console.error('Error fetching exercises:', error);
            throw error;
        });
}

// -------------------------- //
// Create a dropdown of the   //
// user's exercises           //
// -------------------------- //

function createExerciseDropdown(exercises, location) {
    // sort the exercises into alphabetical order
    exercises.sort((a, b) => a.name.localeCompare(b.name));

    let dropdown = `
                <div class="form-row">
                    <select class="form-control" id="exercise-dropdown-${location}">
                    <option value="" disabled selected>Select exercise from list</option>
                </div>
            `;
    
    exercises.forEach(exercise => {
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

// ----------------------------- //
// Swap exercise form            //
// ----------------------------- //

// Main swap exercise function
async function swap_exercise(exercise) {
    // hide the workout
    // cannot directly hide workout-elements as it is not a section container
    let workout = document.querySelector('#workout-elements');
    workout.style.display = 'none';

    // fetch exercises
    let userExercises = await fetchUserExercises(userID);
    fetchedExercises = userExercises;

    // get dropdown of exercises
    let dropdown = createExerciseDropdown(userExercises, 'swap-exercise');
    
    // show swap exercise form
    let swap_exercise_form = createSwapExerciseForm(exercise, dropdown, userExercises);
    document.querySelector('#exercise-adjustments').appendChild(swap_exercise_form);
    show_section(swap_exercise_form);

    // add listner for close the form button
    let closeBtn = document.querySelector('#close_swap_exercise_form');
    closeBtn.removeEventListener('click', close_swap_exercise_form);
    closeBtn.addEventListener('click', close_swap_exercise_form);

}

// Create the form
function createSwapExerciseForm(exercise, dropdown, userExercises) {
    // form section container
    const swap_exercise_form_container = document.createElement('div');
    swap_exercise_form_container.classList = 'section-container';
    swap_exercise_form_container.id = 'swap-exercise-form-container';
    swap_exercise_form_container.style.display = 'none';

    // form title
    const swap_exercise_form_title = document.createElement('div');
    swap_exercise_form_title.id = 'swap-exercise-form-title';
    swap_exercise_form_title.classList = 'section-title';
    swap_exercise_form_title.innerHTML = `<h4>Swap Exercise</h4>
    <div class="close-section" id="close_swap_exercise_form"><strong>Ｘ</strong></div>`;
    
    // form body
    const swap_exercise_form = document.createElement('div');
    swap_exercise_form.classList = 'form-container';
    swap_exercise_form.id = 'swap-exercise-form';
    swap_exercise_form.innerHTML = `
                                    <div class="form-group" id="swap-exercise-dropdown">
                                        <div class="form-row">
                                            <div class="form-group col-md-6">
                                                <label>Swap <strong>${exercise.name}</strong> for:</label>
                                                ${dropdown}
                                            </div>
                                            <div class="form-group col-md-3">
                                            <label>Sets</label>
                                            <input type="number" class="form-control" id="swap-exercise-sets" min="1" step="1" placeholder="Number of sets">  
                                        </div>
                                        <div class="form-group col-md-3">
                                            <label>Reps</label>
                                            <input type="number" class="form-control" id="swap-exercise-reps" min="1" step="1" placeholder="Number of reps per set">
                                        </div>
                                        </div>
                                    </div>
                                    
                                    `;          

    // form submit button
    const swap_exercise_form_submit = document.createElement('div');
    swap_exercise_form_submit.classList = 'section-container action';
    swap_exercise_form_submit.id = 'swap-exercise-form-submit';
    swap_exercise_form_submit.role = 'button';
    swap_exercise_form_submit.onclick = () => submit_swap_exercise_form(exercise, userExercises);
    swap_exercise_form_submit.innerHTML = `<h4>Swap Exercise</h4>`;
                            
    // assemble the form
    swap_exercise_form_container.appendChild(swap_exercise_form_title);
    swap_exercise_form_container.appendChild(swap_exercise_form);
    swap_exercise_form_container.appendChild(swap_exercise_form_submit);
    return swap_exercise_form_container;
}

// Submit the form
async function submit_swap_exercise_form(exercise, all_exercises) {
    // get the selected exercise
    let selected_exercise_id = document.querySelector('#exercise-dropdown-swap-exercise').value;

    // validation for exercise
    if (!selected_exercise_id) {
        alert('Please select an exercise to swap in.');
        return;
    }

    // get the whole exercise object
    let exercise_to_swap_in = all_exercises.find(exercise_iterator => exercise_iterator.id == selected_exercise_id);

    // get the sets and reps
    let sets = document.querySelector('#swap-exercise-sets').value;
    let reps = document.querySelector('#swap-exercise-reps').value;

    // add the sets and reps to the exercise object
    exercise_to_swap_in.sets_in_workout = sets;
    exercise_to_swap_in.reps_per_set = reps;

    // validations for sets and reps
    if (!sets || sets <= 0) {
        alert('Please enter a valid number of sets.');
        return;
    }
    if (!reps || reps <= 0) {
        alert('Please enter a valid number of reps.');
        return;
    }
    
    // select the div where the exercise is to be swapped out
    let exercise_to_swap_out_div = document.querySelector(`#exercise-${exercise.id}-in-workout`);
    // create the div for the exercise to swap in
    let exercise_to_swap_in_div = await create_exercise_in_workout(exercise_to_swap_in);
    
    // swap the exercises
    await exercise_to_swap_out_div.replaceWith(exercise_to_swap_in_div);

    // add event listner for the dropdown-arrow
    addExpandListener(exercise_to_swap_in);

    // Remove the entering class after the animation has finished
    removeEntering(exercise_to_swap_in_div);

    // close the form
    close_swap_exercise_form();
}

// Close the form
async function close_swap_exercise_form() {
    await hide_section(document.querySelector('#swap-exercise-form-container')) 
    document.querySelector('#swap-exercise-form-container').remove();

    // show the workout again
    let workout = document.querySelector('#workout-elements');
    show_section(workout)
}

// -------------------------- //
// Add Exercise               //
// -------------------------- //

// Main swap exercise function
async function add_exercise() {
    // hide the workout
    // cannot directly hide workout-elements as it is not a section container
    let workout = document.querySelector('#workout-elements');
    workout.style.display = 'none';

    // hide the add exercise button
    let add_exercise_btn = document.querySelector('#add-exercise-button');
    add_exercise_btn.style.display = 'none';

    // fetch exercises
    let userExercises = await fetchUserExercises(userID);

    // get dropdown of exercises
    let dropdown = createExerciseDropdown(userExercises, 'add-exercise');
    
    // show add exercise form
    let add_exercise_form = createAddExerciseForm(dropdown, userExercises);
    document.querySelector('#exercise-adjustments').appendChild(add_exercise_form);
    show_section(add_exercise_form);

    // event listener for if user selects add new exercise in drop down
    document.getElementById('add-exercise-name-form-group').addEventListener('change', function(event) {
        if(event.target.value === 'add-new-exercise') {
            create_new_exercise_form();
        }
    });
}

// Create the form
function createAddExerciseForm(dropdown, userExercises) {
    // form section container
    const add_exercise_form_container = document.createElement('div');
    add_exercise_form_container.classList = 'section-container';
    add_exercise_form_container.id = 'add-exercise-form-container';
    add_exercise_form_container.style.display = 'none';

    // form title
    const add_exercise_form_title = document.createElement('div');
    add_exercise_form_title.id = 'add-exercise-form-title';
    add_exercise_form_title.classList = 'section-title';
    add_exercise_form_title.innerHTML = `<h4>Add Exercise To Workout</h4>
    <div class="close-section" id="close_add_exercise_form"><strong>Ｘ</strong></div>`;
    
    // event listener for close form button
    const closeBtn = add_exercise_form_title.querySelector('#close_add_exercise_form');
    closeBtn.removeEventListener('click', close_add_exercise_form);
    closeBtn.addEventListener('click', close_add_exercise_form);
    
    // form body
    const add_exercise_form = document.createElement('div');
    add_exercise_form.classList = 'form-container';
    add_exercise_form.id = 'add-exercise-form';
    add_exercise_form.innerHTML = `
                                    <div class="form-group" id="add-exercise-dropdown">
                                        <div class="form-row">
                                            <div class="form-group col-md-6" id="add-exercise-name-form-group">
                                                <label>Exercise</label>
                                                ${dropdown}
                                            </div>
                                            <div class="form-group col-md-3" id="add-exercise-sets-form-group">
                                            <label>Sets</label>
                                            <input type="number" class="form-control" id="add-exercise-sets" min="1" step="1" placeholder="Number of sets">  
                                        </div>
                                        <div class="form-group col-md-3" id="new-exercise-reps-form-group">
                                            <label>Reps</label>
                                            <input type="number" class="form-control" id="add-exercise-reps" min="1" step="1" placeholder="Number of reps per set">
                                        </div>
                                        </div>
                                    </div>
                                    `;          

    // form submit button
    const add_exercise_form_submit = document.createElement('div');
    add_exercise_form_submit.classList = 'section-container action';
    add_exercise_form_submit.id = 'add-exercise-form-submit';
    add_exercise_form_submit.role = 'button';
    add_exercise_form_submit.onclick = () => submit_add_exercise_form(userExercises);
    add_exercise_form_submit.innerHTML = `<h4>Add Exercise</h4>`;
                          
    // assemble the form
    add_exercise_form_container.appendChild(add_exercise_form_title);
    add_exercise_form_container.appendChild(add_exercise_form);
    add_exercise_form_container.appendChild(add_exercise_form_submit);
    return add_exercise_form_container;
}

// Submit the form
async function submit_add_exercise_form(all_exercises) {
    // get the selected exercise
    let selected_exercise_id = document.querySelector('#exercise-dropdown-add-exercise').value;

    // validation for exercise
    if (!selected_exercise_id) {
        alert('Please select an exercise to add in.');
        return;
    }

    // get the whole exercise object
    let exercise_to_add = all_exercises.find(exercise_iterator => exercise_iterator.id == selected_exercise_id);

    // get the sets and reps
    let sets = document.querySelector('#add-exercise-sets').value;
    let reps = document.querySelector('#add-exercise-reps').value;

    // add the sets and reps to the exercise object
    exercise_to_add.sets_in_workout = sets;
    exercise_to_add.reps_per_set = reps;

    // validations for sets and reps
    if (!sets || sets <= 0) {
        alert('Please enter a valid number of sets.');
        return;
    }
    if (!reps || reps <= 0) {
        alert('Please enter a valid number of reps.');
        return;
    }
    
    // create the div for the exercise to add in
    let exercise_to_add_div = await create_exercise_in_workout(exercise_to_add);
    
    // add the exercise
    document.querySelector('#workout-plan').appendChild(exercise_to_add_div)

    // add event listner for the dropdown-arrow
    addExpandListener(exercise_to_add);

    // Remove the entering class after the animation has finished
    removeEntering(exercise_to_add_div);

    // close the form
    close_add_exercise_form();
}

// Close the form
async function close_add_exercise_form() {
    await hide_section(document.querySelector('#add-exercise-form-container'))
    document.querySelector('#add-exercise-form-container').remove();

    // show the add exercise button again
    let add_exercise_btn = document.querySelector('#add-exercise-button');
    add_exercise_btn.style.display = 'block';

    // show the workout again
    let workout = document.querySelector('#workout-elements');
    await show_section(workout)
}

// -------------------------- //
// CREATE NEW EXERCISE        //
// -------------------------- //

// Create a new exercise form
async function create_new_exercise_form() {

    // hide the add exercise to workout section
    let add_exercise_form = document.getElementById('add-exercise-form-container');
    await hide_section(add_exercise_form);

    // Create the new exercise form
    const form_container = document.createElement('div');
    form_container.className = 'section-container entering';
    form_container.id = 'create-exercise-form-container';

    // div for form title
    const form_title = document.createElement('div');
    form_title.className = 'section-title';
    form_title.id = 'create_exercise_form_title';
    form_title.innerHTML = `
                        <h3>New Exercise</h3>
                        <div class="close-section" id="close_create_exercise_form"><strong>Ｘ</strong></div>
                        `
    // div for form body
    const form_body = document.createElement('form');
    form_body.className = 'form-container';
    form_body.id = 'create-exercise-form';
    form_body.innerHTML = `
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
    `;

    // assemble the form and append to DOM
    form_container.appendChild(form_title);
    form_container.appendChild(form_body);

    // Add the form to the DOM
    document.getElementById('exercise-adjustments').appendChild(form_container);

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
    saveNewExerciseBtn.removeEventListener('click', save_new_exercise);
    saveNewExerciseBtn.addEventListener('click', save_new_exercise);
}
}

// CLOSE THE EXERCISE FORM

// Button action for closing the exercise form without saving
async function closeExerciseForm() {
    let exerciseForm = document.getElementById('create-exercise-form-container');
    await hide_section(exerciseForm);

    // Show the add excercise form again
    let addExerciseForm = document.getElementById('add-exercise-form-container'); 
    show_section(addExerciseForm);
}

// SAVE THE EXERCISE FORM DATA IN THE DB

// Save the new exercise 
async function save_new_exercise() {
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
    await fetch(`/${userID}/exercises/`, {
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

    // Fetch exercises from DB again so we can update the front end
    let userExercises = await fetchUserExercises(userID);
    console.log("added new exercise. fetchedExercises: ", fetchedExercises)

    // remove the create exercise form after hiding it
    let exerciseForm = document.getElementById('create-exercise-form-container');
    await hide_section(exerciseForm);
    exerciseForm.remove();

    // remove the add exercise form
    let addExerciseForm = document.getElementById('add-exercise-form-container');
    addExerciseForm.remove();

    // get dropdown of exercises
    let dropdown = createExerciseDropdown(userExercises, 'add-exercise');
    
    // show add exercise form
    let add_exercise_form = createAddExerciseForm(dropdown, userExercises);
    document.querySelector('#exercise-adjustments').appendChild(add_exercise_form);
    show_section(add_exercise_form);

    // set the exercise-dropdown-add-exercise to the newly created exercise
    let exerciseDropdown = document.getElementById('exercise-dropdown-add-exercise');
    // Find the option with the text that matches newExercise.name and set it as selected
    for (let i = 0; i < exerciseDropdown.options.length; i++) {
        if (exerciseDropdown.options[i].text === newExercise.name) {
            exerciseDropdown.selectedIndex = i;
            break;
        }
    }
    
    // focus on the sets input
    let setsInput = document.getElementById('add-exercise-sets');
    setsInput.focus();
}

// UPDATE THE FRONT END WITH NEW EXERCISE INFO WITHOUT PAGE RELOAD

// Update the front end with the new exercise
async function update_add_exercise_form(newExercise) {
    // hide the create exercise form
    let createExerciseForm = document.getElementById('create-exercise-form-container');
    await hide_section(createExerciseForm);

    // fetch the user's exercises again
    let userExercises = await fetchUserExercises(userID);

    // get dropdown of exercises
    let dropdown = createExerciseDropdown(userExercises, 'add-exercise');

    // show the add exercise form again
    let addExerciseForm = document.getElementById('add-exercise-form-container');
    show_section(addExerciseForm);

}

// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { swap_exercise, add_exercise }