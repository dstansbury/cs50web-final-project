//---------------//
// IMPORTS       //
//---------------//

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

function expand_exercise(sectionDiv, exerciseID){
    // if the section is already expanded, close it
    console.log('checking if the section is open')
    if (sectionDiv.classList.contains('expand')) {
        contract_exercise(sectionDiv, exerciseID);
        return;
    }

    // close any other expanded sections
    console.log('looking for other sections to close')
    const expandedSections = document.querySelectorAll('.expand');
    expandedSections.forEach(expandedSection => {
        contract_exercise(expandedSection, exerciseID);
    });

    // add the animation class
    console.log('adding the expand class')
    sectionDiv.classList.add('expand');

    // Get the exerciseInfoExpanded div we want to show
    const divToShow = document.querySelector(`#expanded-exercise-${exerciseID}`)
    console.log('div to show: ', divToShow)

    // show the expanded exercise information
    divToShow.style.display = 'block';
}

function contract_exercise(sectionDiv, exerciseID){
    console.log('inside the contract function. sectionDiv: ', sectionDiv)
    // if expand is in the class list, remove it
    console.log('checking if the section is expanded')
    sectionDiv.classList.remove('expand');

    // add the animation class
    console.log('adding the contract class')
    sectionDiv.classList.add('contract');

    // hide the expanded exercise information
    const divToHide = document.querySelector(`#expanded-exercise-${exerciseID}`)
    divToHide.style.display = 'none';

    // remove the animation class on animation completion
    sectionDiv.addEventListener('animationend', function() {
        sectionDiv.classList.remove('contract');
    });
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
        // Set up the section div for the exercise
        const exerciseContainer = document.createElement('div')
        exerciseContainer.className="section-container entering"
        exerciseContainer.id = `exercise-${exercise.id}-in-workout-${workout_plan.id}`
        
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
        exerciseActionsDiv.appendChild(swapExerciseButton(exercise.id))
        exerciseActionsDiv.appendChild(viewExerciseHistoryButton(exercise.id))

        // divs for sets
        for (let i = 1; i <= exercise.sets_in_workout; i++){
            let exerciseDiv = createExerciseDiv(i, exercise)
            // add the exercise info to the expanded exercise div
            exerciseInfoExpanded.appendChild(exerciseDiv)
        }

        // Finished assembling expanded exercise div
        exerciseInfoExpanded.insertBefore(exerciseActionsDiv, exerciseInfoExpanded.firstChild)
        exerciseInfoExpanded.insertBefore(exerciseDescriptionDiv,exerciseInfoExpanded.firstChild)
        // Hide the expanded exercise div
        exerciseInfoExpanded.style.display = 'none';

        // Assemble the exerciseDiv
        exerciseContainer.appendChild(exerciseNameDiv)
        exerciseContainer.appendChild(exerciseSetsAndRepsCount)
        exerciseContainer.appendChild(exerciseInfoExpanded)
        
        // Add the final div to the DOM
        document.querySelector("#workout-plan").append(exerciseContainer);

        // add event listner for the dropdown-arrow
        let dropDownArrow = document.getElementById(`dropdown-arrow-${exercise.id}`);
        let exerciseToExpand = document.getElementById(`exercise-${exercise.id}-in-workout-${workout_plan.id}`);
        dropDownArrow.addEventListener('click', function() {
                expand_exercise(exerciseToExpand, exercise.id);
        });

        // Remove the entering class after the animation has finished
        removeEntering(exerciseContainer)
    });
    // Add the add exercise button
    document.querySelector('#secondary-page-action').appendChild(addExerciseButton())
    //Remove the entering class after the animation has finished
    removeEntering(document.querySelector('#secondary-page-action'))

    // Add the end workout button
    document.querySelector('#main-page-action').appendChild(endWorkoutButton())
    // Removed the entering class after the animation has finished
    removeEntering(document.querySelector('#main-page-action'))
}

// -------------------------- //
// Swap exercise button       //
// -------------------------- //
function swapExerciseButton(exerciseID) {
    const swap_exercise_action = document.createElement('button');
    swap_exercise_action.className = 'action-button-outline';
    swap_exercise_action.id = `swap-exercise-button-${exerciseID}`
    swap_exercise_action.onclick = () => swap_exercise(exerciseID)
    swap_exercise_action.innerHTML=`Swap Exercise`
    return swap_exercise_action
}

function swap_exercise(exerciseID) {
    console.log('swap exercise button pressed');
}

// -------------------------- //
// View history button        //
// -------------------------- //
function viewExerciseHistoryButton(exerciseID) {
    const view_history_action = document.createElement('button');
    view_history_action.className = 'action-button';
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
    add_exercise_action.className = 'section-container secondary-action';
    add_exercise_action.id = 'add-exercise-action'
    add_exercise_action.onclick = () => add_exercise()
    add_exercise_action.innerHTML=`
                                <h4>Add Exercise</h4>
                                `
    return add_exercise_action
}

function add_exercise(){
    console.log('add exercise button pressed');
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

function end_workout(workout_plan_id){
    console.log('end workout button pressed');
}

// -------------------------- //
// Exercise Div               //
// -------------------------- //

function createExerciseDiv(i, exercise) {
    const exerciseDiv = document.createElement('div')
    exerciseDiv.className = 'form-group'
    exerciseDiv.id=`exercise-in-workout-${exercise.id}`
    exerciseDiv.innerHTML=`
                        <hr>
                        <div class="set-number" id="set-number-exercise-${exercise.id}">
                            <strong> Set ${i} </strong>
                        </div>
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
                        <div class="action-buttons-container" id="broken-set-button-container">    
                            <button type="button" class="action-button-outline" id="broken-set-button set-${i}-exercise-${exercise.id}" >Broken Set</button>
                        </div>
                        `
    return exerciseDiv
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

export { start_workout };
