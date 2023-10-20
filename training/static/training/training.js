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
            <div class="section-title" id="workout_plan-title-${workout_plan.id}">
                <h3>${workout_plan.title}</h3>
                <div class="dropdown-arrow">▼</div>
            </div>
            <div class="section-description" id="workout_plan-description-${workout_plan.id}"> 
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
        workout_planDiv.classList.remove('open');
        return;
    } else {
        workout_planDiv.classList.add('open');
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

// -------------------------- //
// CREATE WORKOUT PLAN
// -------------------------- //

// -------------------------- //
// Helping functions for create workout plan //
// -------------------------- //

// Global variable for exercises fetched from the DB
// So we only need to call once
let fetchedExercises = [];

// Global variable for exercise number so exercise rows can be uniquely identified
let exercise_number = 1;

// last selected dropdown menu for adding new exercise to
let lastSelectedDropdown = '';

// Hide all section containers
function hide_section_containers() {
    let sectionContainers = document.querySelectorAll('.section-container');
    sectionContainers.forEach(container => {
        container.style.display = 'none';
    });
}

// Show all section containers
function show_section_containers() {
    // Show all section-containers to appear as a page refresh
    let sectionContainers = document.querySelectorAll('.section-container');
    sectionContainers.forEach(container => {
        container.style.display = 'block';
    });
}

// FETCH FROM DB // 

// Get user's exercises from the DB so we can populate into form
function fetch_user_exercises(userID) {
    return fetch(`/${userID}/exercises`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(exercises => {
            console.log('Fetched exercises:', exercises);
            // store the fetched exercises in the global variable
            fetchedExercises = exercises;
            return exercises;
        })
        .catch(error => {
            console.error('Error fetching exercises:', error);
            throw error;
        });
}

// CREATE DROPDOWN MENU OF EXERCISES //

// Generate a dropdown menu of the user's exercises, using the fetched exercises
function generate_exercise_dropdown() {
    // Sort exercises alphabetically by exercise name
    fetchedExercises.sort((a, b) => a.name.localeCompare(b.name));

    let dropdown = `
        <div class="form-group col-md-6">
            <label>Exercise</label>
            <select class="form-control" id="new-workout-plan-exercise-name-${exercise_number}">
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
        <div class="form-row" id="new-workout-plan-exercise-${exercise_number}">
            ${exerciseDropdown}
            <div class="form-group col-md-3">
                <label>Sets</label>
                <input type="number" class="form-control" id="new-workout-plan-exercise-sets-${exercise_number}" placeholder="Number of sets">  
            </div>
            <div class="form-group col-md-3">
                <label>Reps</label>
                <input type="number" class="form-control" id="new-workout-plan-exercise-reps-${exercise_number}" placeholder="Number of reps per set">
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
    document.getElementById('new-workout-plan-exercises').insertAdjacentHTML('beforeend', newRow);
}

// REMOVE AN EXERCISE

// Removes an exercise from the plan form
function remove_exercise_from_form() {
    // check if there is more than one exercise row
    if (exercise_number > 2) {
        // remove the last exercise row from the DOM
        document.getElementById(`new-workout-plan-exercise-${exercise_number - 1}`).remove();
        exercise_number -= 1;
    }
}

// OPEN THE WORKOUT PLAN FORM //   

// Main function for creating a new workout plan //
async function open_create_workout_plan_form() {
    // hide the create workout plan button
    document.getElementById('create-workout-plan-button').style.display = 'none';
    
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

    // create section container for the form
    const form_container = document.createElement('div');
    form_container.className = 'section-container';
    form_container.id = 'create-workout-plan-form-container';
    form_container.innerHTML = `
        <div class="section-title" id="create_workout_plan_form_title">
            <h3>New Workout Plan</h3>
        </div>`

    const form = document.createElement('form');
    form.id = 'create-workout-plan-form';
    form.innerHTML = `
        <div class="form-group">
            <label>Plan Title</label>
            <input type="text" class="form-control" id="new-workout-plan-title" placeholder="New workout plan title">
            <small id="title-help" class="form-text text-muted">Choose a title that will help you find this workout again from a list.</small>
        </div>
        <div class="form-group">
            <label>Plan Description</label>
            <input type="textarea" class="form-control" id="new-workout-plan-description" placeholder="Plan description">
        </div>
        <div class="form-exercises" id="new-workout-plan-exercises">
            ${generate_exercise_row()}
        </div>
        <div class="action-buttons-container" id="new-workout-plan-actions">    
            <button class="action-button-outline" onclick="add_exercise_to_form()">Add Exercise</button>
            <button class="action-button-outline" onclick="remove_exercise_from_form()">Remove Exercise</button>
        </div>
        <br>
        <div class="action-buttons-container" id="new-workout-plan-save">
            <button class="action-button" type="submit">Save Plan</button>
        </div>
    `;

    // add the form to the DOM
    document.getElementById('create-workout-plan').append(form_container);
    document.getElementById('create-workout-plan-form-container').append(form);

    // Set focus to the "Plan Title" input field
    document.getElementById('new-workout-plan-title').focus();

    // add event listener for if use selects add new exercise in dropdown
    document.getElementById('new-workout-plan-exercises').addEventListener('change', function(event) {
        if(event.target.id.startsWith('new-workout-plan-exercise-name') && event.target.value === 'add-new-exercise') {
            lastSelectedDropdown = event.target;
            console.log('lastSelectedDropdown:', lastSelectedDropdown)
            create_new_exercise_form();
        }
    });
    
    // add a submit event listener for the whole form
    document.getElementById('create-workout-plan-form').addEventListener('submit', function(event) {
        event.preventDefault();
        save_workout_plan();
    });
}

// SAVE THE NEW WORKOUT PLAN TO THE DB
function save_workout_plan() {
    // Get the workout plan data from the form
    const workoutPlanTitle = document.getElementById('new-workout-plan-title').value;
    const workoutPlanDescription = document.getElementById('new-workout-plan-description').value;
    
    // Create an array of the exercises in the workout plan
    const workoutPlanExercises = [];
    
    // Loop through each exercise row in the form
    for (let i = 1; i < exercise_number; i++) {
        // Get the exercise ID from the dropdown menu
        const exerciseID = document.getElementById(`new-workout-plan-exercise-name-${i}`).value;
        // Get the exercise name
        const exerciseName = document.getElementById(`new-workout-plan-exercise-name-${i}`).options[document.getElementById(`new-workout-plan-exercise-name-${i}`).selectedIndex].text;
        // Get the number of sets from the form
        const setsInWorkout = document.getElementById(`new-workout-plan-exercise-sets-${i}`).value;
        // Get the number of reps per set from the form
        const repsPerSet = document.getElementById(`new-workout-plan-exercise-reps-${i}`).value;
        // Create an object for the exercise
        const exercise = {
            "id": exerciseID,
            "name": exerciseName,
            "sets_in_workout": setsInWorkout,
            "reps_per_set": repsPerSet,
        }
        // Add the exercise object to the array
        workoutPlanExercises.push(exercise);
    }

    // Create the new workout plan object
    const newWorkoutPlan = {
        "title": workoutPlanTitle,
        "description": workoutPlanDescription,
        "user_id": userID,
        "exercises_in_plan": workoutPlanExercises,
    }

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
    })
        .catch(error => {
            console.error('Error submitting new workout plan to DB:', error);
            throw error;
        })
    
    // Reload page with new workout plan
    window.location.reload();

}


// -------------------------- //
// CREATE EXERCISE            //
// -------------------------- //

// OPEN THE NEW EXERCISE FORM

// Create a new exercise form
function create_new_exercise_form() {
    hide_section_containers()

    // Create the new exercise form
    const form_container = document.createElement('div');
    form_container.className = 'section-container';
    form_container.id = 'create-exercise-form-container';
    form_container.innerHTML = `
        <div class="section-title" id="create_exercise_form_title">
            <h3>New Exercise</h3>
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
            <div class="action-buttons-container" id="new-exercise-actions">
                <button type="button" class="action-button" onclick="save_new_exercise()">Save Exercise</button>
                <button class="action-button-outline" onclick="closeExerciseForm()">Close</button>
            </div>
        </form>
    `;

    // Add the form to the DOM
    document.getElementById('workout_plan-page-container').append(form_container);
    
    setTimeout(() => {
        // Set focus to the "Exercise Name" input field
        const newExerciseNameInput = document.getElementById('new-exercise-name');
        if (newExerciseNameInput) {
            newExerciseNameInput.focus();
        }
    }, 0);
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
    
    // Call the update front end function
    update_exercises_front_end(newExercise);
}

// UPDATE THE FRONT END WITH NEW EXERCISE INFO WITHOUT PAGE RELOAD

// Update the front end with the new exercise
function update_exercises_front_end(newExercise) {
    // Check the user has not entered a blank exercise name
    if (!newExercise.name || newExercise.name.trim() === '') {
        alert('Invalid exercise name');
        return;
    }
    
    // Check the user has not entered 'Add new exercise' as the exercise name
    if (newExercise.name === 'Add new exercise') {
        alert('Invalid exercise name');
        return;
    }

    // Check the user hasn't added an exercise that already exists
    let existingExercise = fetchedExercises.find(exercise => exercise.name.toLowerCase() === newExercise.name.toLowerCase());
    if (existingExercise) {
        alert('Exercise already exists');
        return;
    }

    // Add the new exercise to the global variable
    fetchedExercises.push(newExercise);

    // Grab all the current entries before we regenerate the dropdown menus
    let currentEntries = [];
    let dropdowns = document.querySelectorAll('[id^="new-workout-plan-exercise-name"]');
    dropdowns.forEach(dropdown => {
        currentEntries.push(dropdown.value);
    });

    console.log('currentEntries:', currentEntries);
    
    // Clear all the dropdown menus
    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = '';
    });

    // Regenerate the dropdown menus
    exerciseDropdown = generate_exercise_dropdown();

    // Add the newly generated dropdown menus to the DOM
    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = exerciseDropdown;
    });

    // Remove the new exercise form
    document.getElementById('create-exercise-form-container').remove();

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
            lastSelectedDropdown.value = options[i].value;
            break;
        }
    }

    // Set focus to the last selected dropdown menu
    lastSelectedDropdown.focus();

    show_section_containers();
}

// CLOSE THE EXERCISE FORM

// Button action for closing the exercise form without saving
function closeExerciseForm() {
    document.getElementById('create-exercise-form-container').remove();

    // Show all section-containers to appear as a page refresh
    let sectionContainers = document.querySelectorAll('.section-container');
    sectionContainers.forEach(container => {
        container.style.display = 'block';
    });
}
