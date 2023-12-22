// -------------------------- //
// IMPORTS                    //
// -------------------------- //

import { hide_section, show_section } from './training.js';

// -------------------------- //
// EVENT LISTNERS             //
// -------------------------- //

document.addEventListener('DOMContentLoaded', function() {
    // Profile page
    if (document.querySelector("#profile-page-container")) {
        loadProfilePage(userID);
    }
});


// -------------------------- //
// FUNCTIONS                  //
// -------------------------- //

// -------------------------- //
// Personal Information       //
// -------------------------- //

// Fetch weights
function fetchBodyWeights(userID) {
    return fetch(`/${userID}/body-weights`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(bodyWeights => {
            return bodyWeights;
        })
        .catch(error => {
            console.error('Error fetching weights', error);
            throw error;
        });
}

// Personal Information container
function createPersonalInfoContainer() {
    const personalInfoContainer = document.createElement('div');
    personalInfoContainer.className='section-container';
    personalInfoContainer.id = 'personal-info-container';
    personalInfoContainer.innerHTML = `
        <div class="section-title" id="personal-info-container-title">
            <h4>Personal Information</h4>
            <div class="dropdown-arrow">▼</div>
        </div>
        <div class="section-content" id="personal-info-container-content" style="display: none">
        </div>
    `;
    personalInfoContainer.onclick = () => openPersonalInfoContainer();
    return personalInfoContainer;
}   

// create chart of body weights
function addBodyWeightChart(bodyWeights) {
    const ctx = document.createElement('canvas');
    ctx.className = 'chart';
    ctx.id = 'body-weight-chart';

        // Sort bodyWeights by date in ascending order
    bodyWeights.sort((a, b) => new Date(a.date) - new Date(b.date));

    const dates = bodyWeights.map(weight => weight.date);
    const weights = bodyWeights.map(weight => weight.weight);

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Body Weight (kg)',
                data: weights,
                fill: false,
                borderColor: getComputedStyle(document.documentElement)
                .getPropertyValue('--emphasis').trim(),
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.min(...weights) - 1,
                }
            }
        }
    });
    return ctx
}

// Add weight measurement button
function addWeightMeasurementButton(){
    // create div to house the button
    const weightMeasurementButtonContainer = document.createElement('div');
    weightMeasurementButtonContainer.className = 'action-buttons-container rightalign';
    weightMeasurementButtonContainer.id = 'weight-measurement-button-container';

    // create button itself
    const weightMeasurementButton = document.createElement('button');
    weightMeasurementButton.className = 'action-button';
    weightMeasurementButton.id = 'weight-measurement-button';
    weightMeasurementButton.innerHTML = 'Log weight';
    weightMeasurementButton.onclick = () => addWeightForm();

    // add button to container
    weightMeasurementButtonContainer.appendChild(weightMeasurementButton);

    return weightMeasurementButtonContainer;
}

// function for creating the add Weight form and putting it on the page
async function addWeightForm() {
    // hide the section containers
    const sectionContainers = document.querySelectorAll('.section-container');
    // Hide each section container
    await Promise.all(Array.from(sectionContainers).map(sectionContainer => hide_section(sectionContainer)));

    // create the add weight form if it doesn't already exist
    const addWeightFormContainer = document.querySelector('#add-weight-form-container');
    if (!addWeightFormContainer) {
        const newAddWeightForm = createAddWeightForm();
        document.querySelector("#profile-page-content").appendChild(newAddWeightForm);
        show_section(newAddWeightForm);
        newAddWeightForm.style.display = 'flex';
    } else {
        // if it does exist, show it
        show_section(addWeightFormContainer);
        addWeightFormContainer.style.display = 'flex';
    }
}

// Assemble Personal Information
function assemblePersonalInfo(bodyWeights) {
    const personalInfoContainer = createPersonalInfoContainer();
    const personalInfoDetails = personalInfoContainer.querySelector('#personal-info-container-content');
    personalInfoDetails.appendChild(addBodyWeightChart(bodyWeights));
    personalInfoDetails.appendChild(addWeightMeasurementButton());
    // set display to none so it can be shown with animation
    personalInfoContainer.style.display = 'none';
    return personalInfoContainer;
}

// expand the section on dropdown arrow click / contract it if already open
function openPersonalInfoContainer() {
    const personalInfoContainer = document.querySelector('#personal-info-container');
    const personalInfoDetails = document.querySelector('#personal-info-container-content');
    // check if the Info container is expanded and contract if so
    if (personalInfoContainer.classList.contains('expand')) {
        personalInfoContainer.classList.remove('expand')
        personalInfoContainer.classList.add('contract')
        personalInfoDetails.style.display = 'none';
         // on animation end, remove the closed class
         personalInfoContainer.addEventListener('animationend', function() {
            personalInfoContainer.classList.remove('contract');
        });
        return
    }else{
        // if not, expand it
        personalInfoContainer.classList.remove('contract')
        personalInfoContainer.classList.add('expand')
        personalInfoDetails.style.display = 'block';
    }
}

// -------------------------- //
// ADD WEIGHT FORM            //
// -------------------------- //

// Create add weight form
function createAddWeightForm() {
    // create container for the form
    const addWeightFormContainer = document.createElement('div');
    addWeightFormContainer.className = 'section-container';
    addWeightFormContainer.id = 'add-weight-form-container';

    // create the form itself
    const addWeightForm = document.createElement('form');
    addWeightForm.className = 'form';
    addWeightForm.id = 'add-weight-form';
    addWeightForm.style.display = 'none';

    addWeightForm.innerHTML = `
        <div class="form-title">
            <h4>Add Weight</h4>
        </div>
        <div class="form-content">
            <div class="form-row">
                <div class="form-field">
                    <label for="weight">Weight</label>
                    <input type="number" name="weight" id="weight" placeholder="-" required>
                </div>
                <div class="form-field">
                    <label for="date">Date</label>
                    <input type="date" name="date" id="-" required>
                </div>
                <div class="form-field">
                    <label for="Unit">Unit</label>
                    <select name="unit" id="unit" required>
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    // create the submit button
    const saveWeightButton = document.createElement('div');
    saveWeightButton.className = 'section-container action';
    saveWeightButton.id = 'save-weight-button';
    saveWeightButton.innerHTML = '<h4> Save Weight </h4>';
    saveWeightButton.onclick = () => saveWeight();

    addWeightFormContainer.appendChild(addWeightForm);
    addWeightFormContainer.appendChild(saveWeightButton);

    return addWeightFormContainer;
}

// -------------------------- //
// Workout History            //
// -------------------------- //

// Fetch workouts
function fetchAllWorkouts(userID) {
    return fetch(`/${userID}/workouts`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(workouts => {
            return workouts;
        })
        .catch(error => {
            console.error('Error fetching workouts', error);
            throw error;
        });
}

// Workout history container
function createWorkoutHistoryContainer() {
    const workoutHistoryContainer = document.createElement('div');
    workoutHistoryContainer.className='section-container';
    workoutHistoryContainer.id = 'workout-history-container';
    workoutHistoryContainer.innerHTML = `
        <div class="section-title" id="workout-history-container-title">
            <h4>Recent Workouts</h4>
            <div class="dropdown-arrow">▼</div>
        </div>
        <div class="section-content" id="workout-history-container-content" style="display: none">
        </div>
        
    `;
    return workoutHistoryContainer;
}

// Load workout history into container
function addWorkout(workout) {
    const workoutDiv = document.createElement('div');
    workoutDiv.className = 'workout-in-history';
    workoutDiv.id= `workout-in-history-${workout.id}`;
    workoutDiv.innerHTML = `
        <hr>
        <div class="section-title">
            <h5>${workout.date}</h5>
            <h5>${workout.workout_plan}</h5>
            <div role="button" class="dropdown-arrow" id="dropdown-arrow-workout-history-${workout.id}">▼</div>
        </div>
        `;
    return workoutDiv;
}

// Show more workouts button
function addShowMoreButton() {
    const showMoreButtonContainer = document.createElement('div');
    showMoreButtonContainer.className = 'action-buttons-container rightalign';
    showMoreButtonContainer.id = 'search-by-date-button-container';

    const showMoreButton = document.createElement('button');
    showMoreButton.className = 'action-button';
    showMoreButton.id = 'search-by-date-button';
    showMoreButton.innerHTML = 'Show More Workouts';
    showMoreButton.onclick = showMoreWorkouts();
    
    showMoreButtonContainer.appendChild(showMoreButton);

    return showMoreButtonContainer;
}

// function for showing more workouts
function showMoreWorkouts() {
    return
}


// Assemble Workout History
function assembleWorkoutHistory(workouts) {
    const workoutHistoryContainer = createWorkoutHistoryContainer();
    const workoutHistoryDetails = workoutHistoryContainer.querySelector('#workout-history-container-content');
    // Check if there are more than 2 workouts, and slice the array to get the most recent five
    const lastFiveWorkouts = workouts.length > 2 ? workouts.slice(-2) : workouts;
    for (const workout of lastFiveWorkouts){
        workoutHistoryDetails.appendChild(addWorkout(workout));
    }
    workoutHistoryDetails.appendChild(addShowMoreButton());
    // set to none so it can be shown with animation
    workoutHistoryContainer.style.display = 'none';
    return workoutHistoryContainer;
}

// -------------------------- //
// PERSONAL BESTS             //
// -------------------------- //

// Fetch personal bests
function fetchPersonalBest(userID, exerciseID) {
    return fetch(`/${userID}/${exerciseID}/personal-bests`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(personalBest => {
            return personalBest;
        })
        .catch(error => {
            console.error(`Error fetching personal best for exercise ${exerciseID}: `, error);
            throw error;
        });
}

// Create personal bests container
function createPersonalBestsContainer() {
    const personalBestsContainer = document.createElement('div');
    personalBestsContainer.className='section-container';
    personalBestsContainer.id = 'personal-bests-container';
    personalBestsContainer.innerHTML = `
        <div class="section-title" id="personal-bests-container-title">
            <h4>Personal Bests</h4>
            <div class="dropdown-arrow">▼</div>
        </div>
        <div class="section-content" id="personal-bests-container-content" style="display: none">
        </div>
    `;
    return personalBestsContainer;
}

function assemblePersonalBests() {
    const personalBestsContainer = createPersonalBestsContainer();
    // set to none so it can be shown with animation
    personalBestsContainer.style.display = 'none';
    return personalBestsContainer;
}

// -------------------------- //
// WORKOUT NOW BUTTON         //
// -------------------------- //

// Create workout now button
function createWorkoutNowButton() {
    const workoutNowButton = document.createElement('div');
    workoutNowButton.className = 'section-container action';
    workoutNowButton.id = 'workout-now-button-profile';
    workoutNowButton.innerHTML = '<h4> Workout Now </h4>';
    workoutNowButton.onclick = () => goToWorkoutNowPage(userID);
    // set to none to that it can be shown with animation
    workoutNowButton.style.display = 'none';
    return workoutNowButton;
}

// redirect to workout_plans page
async function goToWorkoutNowPage(userID) {
    // hide all the section-containers on the page
    const sectionContainers = document.querySelectorAll('.section-container');
    // Hide each section container
    await Promise.all(Array.from(sectionContainers).map(sectionContainer => hide_section(sectionContainer)));
    // redirect to workout_plans page
    window.location.href = `/${userID}/workout_plans/`;
}


// -------------------------- //
// LOAD PROFILE PAGE          //
// -------------------------- //

// Load profile page
async function loadProfilePage(userID) {
    let workouts = await fetchAllWorkouts(userID);

    let bodyWeights = await fetchBodyWeights(userID);

    const profilePageContentContainer = document.querySelector('#profile-page-content');

    profilePageContentContainer.append(assemblePersonalInfo(bodyWeights));
    profilePageContentContainer.append(assemblePersonalBests());
    profilePageContentContainer.append(assembleWorkoutHistory(workouts));
    profilePageContentContainer.append(createWorkoutNowButton());

    // show all the section-containers on the page
    const sectionContainers = document.querySelectorAll('.section-container');

    // Show each section container
    await Promise.all(Array.from(sectionContainers).map(sectionContainer => show_section(sectionContainer)));

    // center the workout no button text
    const workoutNowButton = document.querySelector('#workout-now-button-profile');
    workoutNowButton.style.display = 'flex';
    
}

// redirect to profile page
function goToProfilePage(userID) {
    window.location.href = `/${userID}/profile/`;
    
}

// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { fetchAllWorkouts, goToProfilePage };