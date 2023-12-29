//---------------//
// IMPORTS       //
//---------------//

import { swap_exercise, add_exercise } from "./exercises.js";
import { hide_section, show_section } from "./training.js";
import { goToProfilePage } from "./profile.js";

// -------------------------- //
// EVENT LISTENERS //
// -------------------------- //
document.addEventListener('DOMContentLoaded', function() {
    // Workout page
    if (document.querySelector("#workout-page-container")) {
        loadWorkout(workout_plan_id);
    }
});

//----------------------//
// Helper functions     //
//----------------------//

function removeEntering(sectionDiv){
    // add an event listener for the animation end
    sectionDiv.addEventListener('animationend', function() {
        sectionDiv.classList.remove('entering');
    });
}

async function expand_exercise(sectionDiv, exerciseID){
    // if the section is already expanded, close it
    if (sectionDiv.classList.contains('expand')) {
        contract_exercise(sectionDiv);
        return;
    }

    // close any other expanded sections
    const expandedSections = document.querySelectorAll('.expand');
    await expandedSections.forEach(expandedSection => {
        contract_exercise(expandedSection);
    });

    // hide the move up and move down buttons
    const moveExerciseButtonsDiv = document.querySelector(`#move-exercise-buttons-${exerciseID}`)
    moveExerciseButtonsDiv.style.display = 'none';

    // add the animation class
    sectionDiv.classList.add('expand');

    // Get the exerciseInfoExpanded div we want to show
    const divToShow = document.querySelector(`#expanded-exercise-${exerciseID}`)

    // show the expanded exercise information
    divToShow.style.display = 'block';

    // focus on the title section of the div
    const titleDiv = sectionDiv.querySelector(`[id^="exercise-in-workout-name-${exerciseID}"]`);
    if (titleDiv) {
        titleDiv.setAttribute('tabindex', '-1');
        titleDiv.focus();
    }
}

function contract_exercise(sectionDiv){
    // if expand is in the class list, remove it
    sectionDiv.classList.remove('expand');

    // add the animation class
    sectionDiv.classList.add('contract');

    // show the move up and move down buttons
    const moveExerciseButtonsDiv = sectionDiv.querySelector('.move-exercise')
    moveExerciseButtonsDiv.style.display = 'flex';

    // hide the expanded exercise information
    let divToHide = null;
    const children = sectionDiv.querySelectorAll('div'); 
    for (let div of children) {
        if (div.id.startsWith('expanded-exercise-')) {
            divToHide = div;
            break; // Break the loop once the div is found
        }
    }

    divToHide.style.display = 'none';

    // remove the animation class on animation completion
    sectionDiv.addEventListener('animationend', function() {
        sectionDiv.classList.remove('contract');
    });

    // hide the move up button if the first section
    hideFirstMoveUpButton();

    // show the move up button if second section
    showSecondMoveUpButton();
}

// move a div up in the DOM
async function moveUp(sectionDiv) {
    
    const parentDiv = sectionDiv.parentNode;
    
    const aboveDiv = sectionDiv.previousElementSibling;
    
    if (aboveDiv) {
        // Apply exit animations and wait for them to complete
        await Promise.all([hide_section(sectionDiv), hide_section(aboveDiv)]);

        // Swap the positions
        parentDiv.insertBefore(sectionDiv, aboveDiv);

        // Apply enter animations
        await Promise.all([show_section(sectionDiv), show_section(aboveDiv)]);

        // Hide the move up button on the first exercise
        hideFirstMoveUpButton();

        // Show the move up button on the second exercise if not already showing
        showSecondMoveUpButton();
    }
}


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

//-------------------//
// Submit workout    //
//-------------------//

function submitWorkoutToDB(workout_to_submit, workout_plan_id) {
    // Get the CSRF token from the meta tag
    const csrf_token = document.querySelector('meta[name="csrf_token"]').getAttribute('content');

    // Add the CSRF token to the headers
    return fetch(`/${userID}/workouts/${workout_plan_id}`, {
        method: 'POST',
        headers: { 
            'X-Requested-With': 'XMLHttpRequest', 
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token, 
        },
        body: JSON.stringify(workout_to_submit)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error submitting workout:', error);
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
    // add the add exercise button
    document.querySelector('#workout-page-title').append(addExerciseButton())

    // Divs to hold the details of the exercises in the workout
    // loops through the exercises and creates a div for each
    let counter = 0;
    workout_plan.exercises_in_plan.forEach(exercise =>{
        let exerciseContainer = create_exercise_in_workout(exercise, counter)
        
        // Add the exercise to the DOM
        document.querySelector("#workout-plan").append(exerciseContainer);

        // add event listner for the dropdown-arrow
        addExpandListener(exercise, counter);
        counter += 1;

        // Remove the entering class after the animation has finished
        removeEntering(exerciseContainer)
    })

    // Add the end workout button
    document.querySelector('#main-page-action').appendChild(endWorkoutButton())
    // Removed the entering class after the animation has finished
    removeEntering(document.querySelector('#main-page-action'))

    // hide the move up button in first exercise
    hideFirstMoveUpButton()
}

// -------------------------- //
// Swap exercise button       //
// -------------------------- //
function swapExerciseButton(exercise, exerciseDiv) {
    const swap_exercise_action = document.createElement('button');
    swap_exercise_action.className = 'action-button-outline';
    swap_exercise_action.id = `swap-exercise-button-${exercise.id}`
    swap_exercise_action.onclick = () => swap_exercise(exercise, exerciseDiv)
    swap_exercise_action.innerHTML=`Swap Exercise`
    return swap_exercise_action
}

// -------------------------- //
// View PB button        //
// -------------------------- //
function fetchExercisePB(exerciseID) {
    return fetch(`/${userID}/${exerciseID}/personal-best/`, { 
        headers: { 'X-Requested-With': 'XMLHttpRequest' } 
    })
    .then(response => {
        return response.json();
    })
    .then(personal_best => {
        return personal_best;
    })
    .catch(error => {
        console.error('Error fetching personal best:', error);
        throw error;
    });
}

async function view_exercise_PB(exerciseID){
    // fetch exercise PB
    const personal_bests_response = await fetchExercisePB(exerciseID)
    const personal_bests = JSON.parse(personal_bests_response)

    // Sort personalBests by date in descending order
    personal_bests.sort((a, b) => new Date(b.fields.date) - new Date(a.fields.date));

    // grab the first one only and store in the personal_best variable
    let personal_best = personal_bests.slice(0,1)[0];
    console.log('personal_best: ', personal_best)

    // Change the button to Hide Personal Best
    let view_PB_button = document.getElementById(`view-PB-button-${exerciseID}`)
    view_PB_button.innerHTML = 'Hide Personal Best'
    view_PB_button.onclick = () => hide_exercise_PB(exerciseID)

    // create the div to hold the PB
    let PB_div = document.createElement('div')
    PB_div.className = 'personal-best'
    PB_div.id = `personal-best-${exerciseID}`
    
    // if no PB recorded, display message
    if (personal_best === undefined) {
        PB_div.innerHTML = 'No personal best recorded for this exercise.'
    }
    else {
        PB_div.innerHTML = `<strong>Personal Best:</strong> ${personal_best.fields.weight} kgs (${personal_best.fields.weight * 2.2} lbs) on ${personal_best.fields.date}`
    }
   
    // add the div to the DOM
    let exerciseInfoExpanded = document.getElementById(`expanded-exercise-${exerciseID}`)   
    exerciseInfoExpanded.insertBefore(PB_div, exerciseInfoExpanded.firstChild)
}

function hide_exercise_PB(exerciseID){
    // Change the button to View Personal Best
    let view_PB_button = document.getElementById(`view-PB-button-${exerciseID}`)
    view_PB_button.innerHTML = 'View Personal Best'
    view_PB_button.onclick = () => view_exercise_PB(exerciseID)

    // remove the div that holds the PB
    let PB_div = document.getElementById(`personal-best-${exerciseID}`) 
    PB_div.remove()
}

function viewExercisePBButton(exerciseID) {
    const view_PB_action = document.createElement('button');
    view_PB_action.className = 'action-button-outline';
    view_PB_action.id = `view-PB-button-${exerciseID}`
    view_PB_action.onclick = () => view_exercise_PB(exerciseID)
    view_PB_action.innerHTML=`View Personal Best`
    return view_PB_action
}

// -------------------------- //
// Add exercise button        //
// -------------------------- //
function addExerciseButton() {
    const add_exercise_action = document.createElement('button');
    add_exercise_action.className = 'action-button';
    add_exercise_action.id = 'add-exercise-button'
    add_exercise_action.onclick = () => add_exercise()
    add_exercise_action.innerHTML=`Add Exercise`
    return add_exercise_action
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

// ----------- //
// End workout //
// ----------- //

async function end_workout(workout_plan_id){
    
    // create a workout object
    let workoutDetails = {
        workoutPlan: workout_plan_id,
        userID: userID,
        exercises:[],
    }

    // get the number of exercises
    let workoutExercisesContainer = document.querySelector('#workout-plan');

    let workoutExercises = workoutExercisesContainer.querySelectorAll(':scope > *');
    
    // loop through the exercises
    workoutExercises.forEach(exerciseInWorkout => {
        // get the exercise ID
        let exerciseID = exerciseInWorkout.id.match(/exercise-in-workout-container-(\d+)-number-\d+/)[1];

        // construct the exercise object
        let exercise = {
            exerciseID: exerciseID,
            name: document.querySelector(`[id^="exercise-in-workout-name-${exerciseID}"] h4`).innerText,
            sets: [],
        }

        // get the number of sets
        let expandedExerciseContainer = document.getElementById(`expanded-exercise-${exerciseID}`);
        let exerciseSets = expandedExerciseContainer.querySelectorAll('[id^="set-"][id$="-in-workout-container"]');

        // loop through the sets.
        for (let counter = 1; counter <= (exerciseSets.length); counter++) {

            // get the rep count set-${i}-rep-count-exercise-${exercise.id}
            let repCountElement = document.getElementById(`set-${counter}-rep-count-exercise-${exerciseID}`).value;
            let repCount = repCountElement ? repCountElement : 0;

            // get the weight
            let weightElement = document.getElementById(`set-${counter}-weight-exercise-${exerciseID}`).value;
            let weight = weightElement ? weightElement : 0;
            
            // get the units
            let unitsElement = document.getElementById(`set-${counter}-units-exercise-${exerciseID}`).value;
            let units = unitsElement ? unitsElement : 'kg';

            // construct the set object
            let setToSubmit = {
                setNumber: counter,
                exerciseID: exerciseID,
                reps: repCount,
                weight: weight,
                units: units,
            }
            // add the set to the exercise's sets array
            exercise.sets.push(setToSubmit);
        }

        // add the exercise to the workout
        workoutDetails.exercises.push(exercise);
    })

    // warn the user they have blank items and seek confirmation of submit
    // if they confirm, submit the workout
    // if they don't confirm, do nothing
    let hasBlankItems = checkForBlankItems(workoutDetails.exercises);
    if (hasBlankItems) {
        // Warn the user and seek confirmation
        let confirmSubmit = window.confirm(`MISSING INFORMATION\n\n Are you sure you want to submit the workout? \n\n ${hasBlankItems}`);
        if (!confirmSubmit) {
            // User did not confirm; exit the function
            return;
        }else {
            // User confirmed; continue
            await submitWorkoutToDB(workoutDetails, workout_plan_id)

            // redirect to the user's profile page
            goToProfilePage(userID)
        }
    }
}

// -------------------------- //
// Check for incomplete items  //
// -------------------------- //

function checkForBlankItems(exercises_in_workout_to_submit) {
    // Set up error message
    let errorMessage = '';
    // loop through the exercises
    exercises_in_workout_to_submit.forEach(exercise => {
        // loop through sets
       exercise.sets.forEach(set => {
            // check if reps and weight are filled
            if (set.reps !== 0 && set.weight !== 0) {
                //pass
            }
            // check if reps and weight are blank
            if (set.reps === 0 && set.weight === 0) {
                errorMessage += `${exercise.name}: set ${set.setNumber} is missing reps and weight.\n`
            }
            // check for blank reps
            else if (set.reps === 0) {
                errorMessage += `${exercise.name}: set ${set.setNumber} has a blank rep count.\n`
            }
            // check for blank weight
            else if (set.weight === 0) {
                errorMessage += `${exercise.name}: set ${set.setNumber} has a blank weight.\n`
            }
       })
    })
    return errorMessage
}

// -------------------------- //
// Add Set Button             //
// -------------------------- //

function addSetButton(exerciseID) {
    const add_set_button = document.createElement('button');
    add_set_button.className = 'action-button';
    add_set_button.id = `add-set-button-${exerciseID}`;
    add_set_button.onclick = () => add_set(exerciseID);
    add_set_button.innerHTML=`Add Set`

    return add_set_button;
}

function add_set(exerciseID) {
    // find all the divs of sets currently in the exercise
    let setsInExercise = document.querySelectorAll(`[id^="set-"][id$="${exerciseID}-in-workout-container"]`);
    console.log('exerciseID: ', exerciseID)
    // add new set
    let newSet = createExerciseDetailsDiv((setsInExercise.length+1), exerciseID)
    
    // get the div of the previous set
    let previousSet = document.getElementById(`set-${setsInExercise.length}-exercise-${exerciseID}-in-workout-container`)

    if (previousSet) {
        // add the new set after it
        previousSet.insertAdjacentElement('afterend', newSet)
    }
    else {
        // add the new set before the add and remove sets div
        let addAndRemoveSetsDivContainer = document.getElementById(`add-and-remove-sets-container-${exerciseID}`)
        addAndRemoveSetsDivContainer.insertAdjacentElement('beforebegin', newSet)
    }

    // show the remove set button if we have just added the first set
    if (setsInExercise.length+1 === 1) {
        showRemoveSetButton(exerciseID)
    }
}

// -------------------------- //
// Remove Set Button          //
// -------------------------- //

function removeSetButton(exerciseID) {
    const remove_set_button = document.createElement('button');
    remove_set_button.className = 'action-button';
    remove_set_button.id = `remove-set-button-${exerciseID}`;
    remove_set_button.onclick = () => remove_set(exerciseID);
    remove_set_button.innerHTML=`Remove Set`
    return remove_set_button;
}

function remove_set(exerciseID) {
    // find all the divs of sets currently in the exercise
    let setsInExercise = document.querySelectorAll(`[id^="set-"][id$="${exerciseID}-in-workout-container"]`);

    console.log('setsInExercise: ', setsInExercise)
    console.log('setsInExercise.length: ', setsInExercise.length)

    // get the div of the final set in the exercise
    let finalSet = document.getElementById(`set-${setsInExercise.length}-exercise-${exerciseID}-in-workout-container`)

    if (finalSet){
        // remove the final set
        finalSet.remove()
    }
    else {
        console.log('ERROR: no sets to remove')
    }

    // hide the remove set button if there are no sets left after performing the remove
    if (setsInExercise.length-1 === 0) {
        hideRemoveSetButton(exerciseID)
    }
}

function hideRemoveSetButton(exerciseID) {
    let removeSetsButton = document.getElementById(`remove-set-button-${exerciseID}`)
    removeSetsButton.style.display = 'none';

    // maintain the right align of the add set button
    let addAndRemoveSetsDiv = document.getElementById(`add-and-remove-sets-${exerciseID}`)
    addAndRemoveSetsDiv.classList.add('rightalign')
}

function showRemoveSetButton(exerciseID) {
    let removeSetButton = document.getElementById(`remove-set-button-${exerciseID}`)
    removeSetButton.style.display = 'block';

    // revert the action container to the flex style
    let addAndRemoveSetsDiv = document.getElementById(`add-and-remove-sets-${exerciseID}`)
    addAndRemoveSetsDiv.classList.remove('rightalign')
}


// -------------------------- //
// Delete Exercise Button     //
// -------------------------- //
function deleteExerciseButton(exerciseID, counter) {
    const delete_exercise_button = document.createElement('button');
    delete_exercise_button.className = 'action-button-outline';
    delete_exercise_button.id = `delete-exercise-${exerciseID}`;
    delete_exercise_button.onclick = () => delete_exercise(exerciseID, counter);
    delete_exercise_button.innerHTML=`Remove Exercise`
    return delete_exercise_button;
}

async function delete_exercise(exerciseID, counter) {
    // animate the removal of the section
    await hide_section(document.querySelector(`#exercise-in-workout-container-${exerciseID}-number-${counter}`));
    // Remove the exercise from the DOM
    document.querySelector(`#exercise-in-workout-container-${exerciseID}-number-${counter}`).remove();
    // Hide the move up button on the first exercise
    hideFirstMoveUpButton();
    // Show the move up button on the second exercise
    showSecondMoveUpButton();
}


// -------------------------- //
// Exercise in workout        //
// -------------------------- //

function create_exercise_in_workout(exercise, counter) {
    // Set up the section div for the exercise
    const exerciseContainer = document.createElement('div')
    exerciseContainer.className="section-container entering"
    exerciseContainer.id = `exercise-in-workout-container-${exercise.id}-number-${counter}`
    
    // div for exercise name
    const exerciseNameDiv = document.createElement('div')
    exerciseNameDiv.className = `section-title`
    exerciseNameDiv.id = `exercise-in-workout-name-${exercise.id}-number-${counter}`
    exerciseNameDiv.innerHTML=`
                                <h4>${exercise.name}</h4>
                                <div role="button" class="dropdown-arrow" id="dropdown-arrow-${exercise.id}">▼</div>
                                `

    // div for sets and reps count
    const exerciseSetsAndRepsCount = document.createElement('div')
    exerciseSetsAndRepsCount.className = 'sets-and-reps-count'
    exerciseSetsAndRepsCount.id = `sets-and-reps-count-${exercise.id}-number-${counter}`
    exerciseSetsAndRepsCount.innerHTML =`
                                        <p>${exercise.sets_in_workout} x ${exercise.reps_per_set} reps </p>
                                        `
    // div for move up and move down buttons
    const moveExerciseButtonsDiv = document.createElement('div')
    moveExerciseButtonsDiv.className = `action-buttons-container move-exercise`
    moveExerciseButtonsDiv.id = `move-exercise-buttons-${exercise.id}`
    moveExerciseButtonsDiv.appendChild(deleteExerciseButton(exercise.id, counter))
    moveExerciseButtonsDiv.appendChild(moveExerciseUpButton(exerciseContainer))

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
        exerciseDescription = '';
    } else {
        // Assign the actual description if available
        exerciseDescription = exercise.description;
    }
    exerciseDescriptionDiv.innerHTML=`
                                     <p>${exerciseDescription}</p>
                                     `

    // div for exercise-level actions
    const exerciseActionsDiv = document.createElement('div')
    exerciseActionsDiv.className = `action-buttons-container`
    exerciseActionsDiv.id = `exercise-in-workout-actions-${exercise.id}`
    exerciseActionsDiv.appendChild(swapExerciseButton(exercise, exerciseContainer))
    exerciseActionsDiv.appendChild(viewExercisePBButton(exercise.id))

    // divs for sets
    for (let i = 1; i <= exercise.sets_in_workout; i++){
        let exerciseDiv = createExerciseDetailsDiv(i, exercise.id)
        // add the exercise info to the expanded exercise div
        exerciseInfoExpanded.appendChild(exerciseDiv)
    }

    // Add and Remove Sets div
    let addAndRemoveSetsDivContainer = document.createElement('div')
    addAndRemoveSetsDivContainer.className = `add-and-remove-sets-container`
    addAndRemoveSetsDivContainer.id = `add-and-remove-sets-container-${exercise.id}`
    addAndRemoveSetsDivContainer.innerHTML=`<hr>`

    let addAndRemoveSetsDiv = document.createElement('div')
    addAndRemoveSetsDiv.className = 'action-buttons-container'
    addAndRemoveSetsDiv.id = `add-and-remove-sets-${exercise.id}`
    addAndRemoveSetsDiv.appendChild(removeSetButton(exercise.id))
    addAndRemoveSetsDiv.appendChild(addSetButton(exercise.id))

    addAndRemoveSetsDivContainer.appendChild(addAndRemoveSetsDiv)

    // Finish assembling expanded exercise div
    exerciseInfoExpanded.insertBefore(exerciseActionsDiv, exerciseInfoExpanded.firstChild)
    exerciseInfoExpanded.insertBefore(exerciseDescriptionDiv,exerciseInfoExpanded.firstChild)
    exerciseInfoExpanded.appendChild(addAndRemoveSetsDivContainer)
    
    // Hide the expanded exercise div
    exerciseInfoExpanded.style.display = 'none';

    // Assemble the exerciseDiv
    exerciseContainer.appendChild(exerciseNameDiv)
    exerciseContainer.appendChild(exerciseSetsAndRepsCount)
    exerciseContainer.appendChild(moveExerciseButtonsDiv)
    exerciseContainer.appendChild(exerciseInfoExpanded)

    return exerciseContainer
};

// -------------------------- //
// Move exercise up button    //
// -------------------------- //
function moveExerciseUpButton(exercise) {
    const move_exercise_up_action = document.createElement('button');
    move_exercise_up_action.className = 'action-button-outline';
    move_exercise_up_action.id = `move-exercise-up-button`
    move_exercise_up_action.addEventListener('click', function(event) {
        event.stopPropagation();
        moveUp(exercise);
    });
    move_exercise_up_action.innerHTML=`Move Exercise Up`
    return move_exercise_up_action
}

// Hides the first exercise's move up button
function hideFirstMoveUpButton() {
    const firstExercise = document.querySelector('#workout-plan').firstElementChild;
    const moveExerciseButtonsDiv = firstExercise.querySelector('.move-exercise')
    moveExerciseButtonsDiv.style.display = 'none';
}

// Shows the second exercise's move up button if not already showing
function showSecondMoveUpButton() {
    const secondExercise = document.querySelector('#workout-plan').children[1];
    const moveExerciseButtonsDiv = secondExercise.querySelector('.move-exercise')
    moveExerciseButtonsDiv.style.display = 'flex';
}

// -------------------------- //
// Expand exercise            //
// -------------------------- //

function addExpandListener(exercise, counter) {
    let exerciseToExpand = document.getElementById(`exercise-in-workout-container-${exercise.id}-number-${counter}`);
    let clickablePartOfExerciseDiv = document.getElementById(`exercise-in-workout-name-${exercise.id}-number-${counter}`);
    clickablePartOfExerciseDiv.addEventListener('click', function() {
            expand_exercise(exerciseToExpand, exercise.id);
        });
}

// -------------------------- //
// Exercise Details Div       //
// -------------------------- //

function createExerciseDetailsDiv(i, exerciseID) {
    const exerciseDetailsDiv = document.createElement('div')
    exerciseDetailsDiv.className = 'form-group'
    exerciseDetailsDiv.id=`set-${i}-exercise-${exerciseID}-in-workout-container`
    exerciseDetailsDiv.innerHTML=`
                        <hr>
                        <div class="set-number" id="set-${i}-exercise-${exerciseID}">
                            <strong> Set ${i} </strong>
                            <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label>Reps completed</label>
                                    <input type="number" class="form-control" id="set-${i}-rep-count-exercise-${exerciseID}" min="1" step="1" placeholder="Enter Reps">  
                                </div>
                                <div class="form-group col-md-4">
                                    <label>Weight</label>
                                    <input type="number" class="form-control" id="set-${i}-weight-exercise-${exerciseID}" min="1" step="0.01" placeholder="Enter Weight">
                                </div>
                                <div class="form-group col-md-4">
                                    <label>Units</label>
                                    <select class="form-control" id="set-${i}-units-exercise-${exerciseID}">
                                        <option value="" selected>Kg</option>
                                        <option value="">Lbs</option> 
                                    </select>
                                </div>
                            </div>
                        </div>
                        `
    return exerciseDetailsDiv
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
async function start_workout(workout_plan_id) {
    // Hide the section containers currently on page
    // Get all the section containers
    const sectionContainers = document.querySelectorAll('.section-container[id^="workout-plan-container"], .section-container[id^="create-workout-plan-action"]');
    // Hide each section container
    await Promise.all(Array.from(sectionContainers).map(sectionContainer => hide_section(sectionContainer)));

    // Load the workout page for that plan
    window.location.href = `/${userID}/workouts/${workout_plan_id}`;
}


//---------------//
// EXPORTS       //
//---------------//

export { start_workout, createExerciseDetailsDiv, create_exercise_in_workout, addExpandListener, removeEntering, hideFirstMoveUpButton };
