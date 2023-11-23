// -------------------------- //
// IMPORTS                    //
// -------------------------- //

import { show_section, hide_section } from "./training.js";
import { load_workout_plans } from "./workoutPlans.js";

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
        <div class="form-group col-md-6">
            <label>Exercise</label>
            <select class="form-control" id="exercise-dropdown-${location}">
            <option value="" disabled selected>Select exercise from list</option>
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
// Swap exercise form //
// ----------------------------- //

// Create the form
function createSwapExerciseForm(exercise, dropdown) {
    // form section container
    const swap_exercise_form_container = document.createElement('div');
    swap_exercise_form_container.classList = 'section-container';
    swap_exercise_form_container.id = 'swap-exercise-form-container';

    // form title
    const swap_exercise_form_title = document.createElement('div');
    swap_exercise_form.id = 'swap-exercise-form-title';
    swap_exercise_form.classList = 'section-title';
    swap_exercise_form.innerHTML = `<h4>Swap Exercise</h4>
                                <div class="close-section" id="close_create_exercise_form" onclick='close_swap_exercise_form()'><strong>Ｘ</strong></div>
                                `;
    // form body
    const swap_exercise_form = document.createElement('div');
    swap_exercise_form.classList = 'form-control';
    swap_exercise_form.id = 'swap-exercise-form';
    swap_exercise_form.innerHTML = `
                                    <div class="form-row" id="swap-exercise-form-row">
                                        Swap <strong>${exercise.name}</strong> for: ${dropdown}
                                    </div>
                                    `;          

    // form submit button
    const swap_exercise_form_submit = document.createElement('div');
    swap_exercise_form_submit.classList = 'section-container action';
    swap_exercise_form_submit.id = 'swap-exercise-form-submit';
    swap_exercise_form_submit.role = 'button';
    swap_exercise_form_submit.onclick = () => submit_swap_exercise_form(exercise);
    swap_exercise_form_submit.innerHTML = `<h4>Swap Exercise</h4>`;
                            
    // assemble the form
    swap_exercise_form_container.appendChild(swap_exercise_form_title);
    swap_exercise_form_container.appendChild(swap_exercise_form);
    swap_exercise_form_container.appendChild(swap_exercise_form_submit);
    swap_exercise_form_container.display.style = 'none';
    return swap_exercise_form_container;
}

// Submit the form
function submit_swap_exercise_form(exercise) {
    // get the selected exercise
    let selected_exercise_id = document.querySelector('#exercise-dropdown-swap-exercise').value;

    // THIS IS WHERE THE LOGIC IS LACKING
}

// Close the form
function close_swap_exercise_form() {
    document.querySelector('#swap-exercise-form-container').remove();

    // show the workout again
    let workout = document.querySelector('#workout-elements');
    show_section(workout)
}

// Main swap exercise function
function swap_exercise(exercise) {
    // hide the workout
    let workout = document.querySelector('#workout-elements');
    hide_section(workout);

    // fetch exercises
    let userExercises = fetchUserExercises(userID);

    // get dropdown of exercises
    let dropdown = createExerciseDropdown(userExercises, 'swap-exercise');
    
    // show swap exercise form
    let swap_exercise_form = createSwapExerciseForm(exercise, dropdown);
    document.querySelector('#exercise-adjustments').appendChild(swap_exercise_form);
    show_section(swap_exercise_form);
    
    // select exercise

    // render it back onto the workout page
    console.log('swap exercise button pressed');
}

// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { swap_exercise }