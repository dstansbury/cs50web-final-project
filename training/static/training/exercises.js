// -------------------------- //
// IMPORTS                    //
// -------------------------- //

import { show_section, hide_section } from "./training.js";
import { create_exercise_in_workout } from "./workout.js";
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
    console.log('Exercises: ', exercises)
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

    // get dropdown of exercises
    let dropdown = createExerciseDropdown(userExercises, 'swap-exercise');
    
    // show swap exercise form
    let swap_exercise_form = createSwapExerciseForm(exercise, dropdown, userExercises);
    document.querySelector('#exercise-adjustments').appendChild(swap_exercise_form);
    show_section(swap_exercise_form);
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
    <div class="close-section" id="close_create_exercise_form"><strong>Ｘ</strong></div>`;
    
    // event listener for close form button
    const closeBtn = swap_exercise_form_title.querySelector('#close_create_exercise_form');
    closeBtn.removeEventListener('click', close_swap_exercise_form);
    closeBtn.addEventListener('click', close_swap_exercise_form);
    
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
    console.log('Exercise to swap out div: ', exercise_to_swap_out_div)
    // create the div for the exercise to swap in
    let exercise_to_swap_in_div = await create_exercise_in_workout(exercise_to_swap_in);
    console.log('Exercise to swap in div: ', exercise_to_swap_in_div)
    
    // swap the exercises
    exercise_to_swap_out_div.replaceWith(exercise_to_swap_in_div);

    console.log('Exercise to swap in div: ', exercise_to_swap_in_div)

    // close the form
    close_swap_exercise_form();
}

// Close the form
function close_swap_exercise_form() {
    document.querySelector('#swap-exercise-form-container').remove();

    // show the workout again
    let workout = document.querySelector('#workout-elements');
    show_section(workout)
}

// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { swap_exercise }