//---------------//
// IMPORTS       //
//---------------//

import { swap_exercise, add_exercise } from "./exercises.js";
import { hide_section, show_section } from "./training.js";

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
    const titleDiv = document.querySelector(`#exercise-in-workout-name-${exerciseID}`)
    titleDiv.focus();
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
        let exerciseContainer = create_exercise_in_workout(exercise)
        
        // Add the exercise to the DOM
        document.querySelector("#workout-plan").append(exerciseContainer);

        // add event listner for the dropdown-arrow
        addExpandListener(exercise);

        // Remove the entering class after the animation has finished
        removeEntering(exerciseContainer)
    })

    // Add the add exercise button
    document.querySelector('#secondary-page-action').appendChild(addExerciseButton())
    //Remove the entering class after the animation has finished
    removeEntering(document.querySelector('#secondary-page-action'))

    // Add the end workout button
    document.querySelector('#main-page-action').appendChild(endWorkoutButton())
    // Removed the entering class after the animation has finished
    removeEntering(document.querySelector('#main-page-action'))

    // hide the move up and move down buttons if there is only one exercise
    if (workout_plan.exercises_in_plan.length === 1) {
        const moveExerciseButtonsDiv = document.querySelector(`#move-exercise-buttons-${workout_plan.exercises_in_plan[0].id}`)
        moveExerciseButtonsDiv.style.display = 'none';
    }
}

// -------------------------- //
// Swap exercise button       //
// -------------------------- //
function swapExerciseButton(exercise) {
    const swap_exercise_action = document.createElement('button');
    swap_exercise_action.className = 'action-button-outline';
    swap_exercise_action.id = `swap-exercise-button-${exercise.id}`
    swap_exercise_action.onclick = () => swap_exercise(exercise)
    swap_exercise_action.innerHTML=`Swap Exercise`
    return swap_exercise_action
}

// -------------------------- //
// View history button        //
// -------------------------- //
function viewExerciseHistoryButton(exerciseID) {
    const view_history_action = document.createElement('button');
    view_history_action.className = 'action-button-outline';
    view_history_action.id = `view-history-button-${exerciseID}`
    view_history_action.onclick = () => view_exercise_history(exerciseID)
    view_history_action.innerHTML=`View History`
    return view_history_action
}

function view_exercise_history(exerciseID){
    console.log('view history button pressed');
}

// -------------------------- //
// Add exercise button        //
// -------------------------- //
function addExerciseButton() {
    const add_exercise_action = document.createElement('div');
    add_exercise_action.className = 'section-container action';
    add_exercise_action.id = 'add-exercise-action'
    add_exercise_action.onclick = () => add_exercise()
    add_exercise_action.innerHTML=`
                                <h4>Add Exercise</h4>
                                `
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
                                <h4>Finish Workout</h4>
                                `
    return end_workout_action
}

function end_workout(workout_plan_id){
    console.log('end workout button pressed');
}

// -------------------------- //
// Broken set button          //
// -------------------------- //
function brokenSetButton(i, exerciseID) {
    const broken_set_action_container = document.createElement('div');
    broken_set_action_container.className = 'action-buttons-container rightalign';
    broken_set_action_container.id = `broken-set-action-container-set-${i}-exercise-${exerciseID}`;
    
    const broken_set_action = document.createElement('button');
    broken_set_action.className = 'action-button-outline';
    broken_set_action.id = `broken-set-button-set-${i}-exercise-${exerciseID}`;
    broken_set_action.onclick = () => broken_set(i, exerciseID)
    broken_set_action.innerHTML=`Broken Set`

    broken_set_action_container.appendChild(broken_set_action)

    return broken_set_action_container
}

function broken_set(i, exerciseID){
    let j = `${i}.1`
    const brokenSetDiv = document.createElement('div')
    brokenSetDiv.className = 'broken-set'
    brokenSetDiv.id = `broken-set-${j}-exercise-${exerciseID}`
    let brokenSetInfo = createExerciseDetailsDiv(j, exerciseID)
    brokenSetDiv.appendChild(brokenSetInfo) 

    const setDiv = document.getElementById(`set-${i}-exercise-${exerciseID}`)
    const brokenSetButtonToReplace = document.getElementById(`broken-set-action-container-set-${i}-exercise-${exerciseID}`)
    console.log('setDiv: ', setDiv)
    console.log('brokenSetButtonToReplace: ', brokenSetButtonToReplace)
    setDiv.parentElement.replaceChild(brokenSetDiv, brokenSetButtonToReplace)
}

// -------------------------- //
// Delete Exercise Button      //
// -------------------------- //
function deleteExerciseButton(exerciseID) {
    const delete_exercise_action_container = document.createElement('div');
    delete_exercise_action_container.className = 'action-buttons-divider delete-exercise';
    delete_exercise_action_container.id = `delete-exercise-action-container-${exerciseID}`;
    delete_exercise_action_container.innerHTML=`<hr>`

    const delete_exercise_action = document.createElement('div');
    delete_exercise_action.className = 'section-container action';
    delete_exercise_action.id = `delete-exercise-${exerciseID}`;
    delete_exercise_action.onclick = () => delete_exercise(exerciseID);
    delete_exercise_action.innerHTML=`
                                                <h4>Delete Exercise</h4>
                                            `
    delete_exercise_action_container.appendChild(delete_exercise_action)
    return delete_exercise_action_container;
}

function delete_exercise(exerciseID) {
    document.querySelector(`#exercise-${exerciseID}-in-workout`).remove();
}


// -------------------------- //
// Exercise in workout        //
// -------------------------- //

function create_exercise_in_workout(exercise) {
    // Set up the section div for the exercise
    const exerciseContainer = document.createElement('div')
    exerciseContainer.className="section-container entering"
    exerciseContainer.id = `exercise-${exercise.id}-in-workout`
    
    // div for exercise name
    const exerciseNameDiv = document.createElement('div')
    exerciseNameDiv.className = `section-title`
    exerciseNameDiv.id = `exercise-in-workout-name-${exercise.id}`
    exerciseNameDiv.innerHTML=`
                                <h4>${exercise.name}</h4>
                                <div role="button" class="dropdown-arrow" id="dropdown-arrow-${exercise.id}">▼</div>
                                `

    // div for sets and reps count
    const exerciseSetsAndRepsCount = document.createElement('div')
    exerciseSetsAndRepsCount.className = 'sets-and-reps-count'
    exerciseSetsAndRepsCount.id = `sets-and-reps-count-${exercise.id}`
    exerciseSetsAndRepsCount.innerHTML =`
                                        <p>${exercise.sets_in_workout} x ${exercise.reps_per_set} reps </p>
                                        `
    // div for move up and move down buttons
    const moveExerciseButtonsDiv = document.createElement('div')
    moveExerciseButtonsDiv.className = `action-buttons-container move-exercise rightalign`
    moveExerciseButtonsDiv.id = `move-exercise-buttons-${exercise.id}`
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
        exerciseDescription = 'DESCRIPTION GOES HERE';
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
    exerciseActionsDiv.appendChild(swapExerciseButton(exercise))
    exerciseActionsDiv.appendChild(viewExerciseHistoryButton(exercise.id))

    // divs for sets
    for (let i = 1; i <= exercise.sets_in_workout; i++){
        let exerciseDiv = createExerciseDetailsDiv(i, exercise)
        // add the exercise info to the expanded exercise div
        exerciseInfoExpanded.appendChild(exerciseDiv)
    }
    // Delete Exercise Button
    let deleteExerciseButtonDiv = deleteExerciseButton(exercise.id)
    
    // Finish assembling expanded exercise div
    exerciseInfoExpanded.insertBefore(exerciseActionsDiv, exerciseInfoExpanded.firstChild)
    exerciseInfoExpanded.insertBefore(exerciseDescriptionDiv,exerciseInfoExpanded.firstChild)
    exerciseInfoExpanded.appendChild(deleteExerciseButtonDiv)
    
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


// -------------------------- //
// Expand exercise            //
// -------------------------- //

function addExpandListener(exercise) {
    let exerciseToExpand = document.getElementById(`exercise-${exercise.id}-in-workout`);
    exerciseToExpand.addEventListener('click', function() {
            expand_exercise(exerciseToExpand, exercise.id);
        });
}

// -------------------------- //
// Exercise Details Div       //
// -------------------------- //

function createExerciseDetailsDiv(i, exercise) {
    const exerciseDetailsDiv = document.createElement('div')
    exerciseDetailsDiv.className = 'form-group'
    exerciseDetailsDiv.id=`exercise-in-workout-${exercise.id}`
    exerciseDetailsDiv.innerHTML=`
                        <hr>
                        <div class="set-number" id="set-${i}-exercise-${exercise.id}">
                            <strong> Set ${i} </strong>
                            <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label>Reps completed</label>
                                    <input type="number" class="form-control" id="set-${i}-rep-count-exercise-${exercise.id}" min="1" step="1" placeholder="Enter Reps">  
                                </div>
                                <div class="form-group col-md-4">
                                    <label>Weight</label>
                                    <input type="number" class="form-control" id="set-${i}-weight-exercise-${exercise.id}" min="1" step="0.01" placeholder="Enter Weight">
                                </div>
                                <div class="form-group col-md-4">
                                    <label>Units</label>
                                    <select class="form-control" id="set-${i}-units-exercise-${exercise.id}">
                                        <option value="" selected>Kg</option>
                                        <option value="">Lbs</option> 
                                    </select>
                                </div>
                            </div>
                        </div>
                        `
    exerciseDetailsDiv.appendChild(brokenSetButton(i, exercise.id))
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
function start_workout(workout_plan_id) {
    window.location.href = `/${userID}/workouts/${workout_plan_id}`;
}


//---------------//
// EXPORTS       //
//---------------//

export { start_workout, createExerciseDetailsDiv, create_exercise_in_workout, addExpandListener, removeEntering };
