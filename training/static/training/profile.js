// -------------------------- //
// IMPORTS                    //
// -------------------------- //

import { hide_section, show_section } from './training.js';

// -------------------------- //
// EVENT LISTNERS             //
// -------------------------- //

document.addEventListener('DOMContentLoaded', async function() {
    // Profile page
    if (document.querySelector("#profile-page-container")) {
        await loadProfilePage(userID);
    }
    // check for profile page in local storage
    if (localStorage.getItem('openPersonalInfo') === 'true') {
        // open the personal info container
        openPersonalInfoContainer();
        // remove the flag
        localStorage.removeItem('openPersonalInfo');
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
    return ctx;
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
    await Promise.all(Array.from(sectionContainers).map(sectionContainer => sectionContainer.style.display = 'none'));

    // create the add weight form if it doesn't already exist
    const addWeightFormContainer = document.querySelector('#add-weight-form-container');
    if (!addWeightFormContainer) {
        const newAddWeightForm = createAddWeightForm();
        document.querySelector("#profile-page-content").appendChild(newAddWeightForm);
        show_section(newAddWeightForm);
        newAddWeightForm.style.display = 'block';
    } else {
        // if it does exist, show it
        show_section(addWeightFormContainer);
        addWeightFormContainer.style.display = 'flex';
    }
}

// Assemble Personal Information
function assemblePersonalInfo(bodyWeights) {
    const ruleOff = document.createElement('hr');
    ruleOff.className = 'rule-off';
    ruleOff.id = 'rule-off-personal-info';
    const personalInfoContainer = createPersonalInfoContainer();
    const personalInfoDetails = personalInfoContainer.querySelector('#personal-info-container-content');
    personalInfoDetails.appendChild(addBodyWeightChart(bodyWeights));
    personalInfoDetails.appendChild(ruleOff);
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

    // form title
    const addWeightFormTitle = document.createElement('div');
    addWeightFormTitle.id = 'add-weight-form-title';
    addWeightFormTitle.classList = 'section-title';
    addWeightFormTitle.innerHTML = `<h4>Add Weight</h4>
    <div class="close-section" id="close_add_weight_form"><strong>Ｘ</strong></div>`;

    // event listener for close form button
    const closeBtn = addWeightFormTitle.querySelector('#close_add_weight_form');
    closeBtn.removeEventListener('click', close_add_weight_form);
    closeBtn.addEventListener('click', close_add_weight_form);

    // create the form itself
    const addWeightForm = document.createElement('form');
    addWeightForm.className = 'form-container';
    addWeightForm.id = 'add-weight-form';
    addWeightForm.innerHTML = `
        <div class="form-group">
            <div class="form-row">
                <div class="form-group col-md-4" id="add-weight-form-weight">
                    <label>Weight</label>
                    <input type="number" class="form-control" name="weight" id="weight" placeholder="Enter weight" required>
                </div>
                <div class="form-group col-md-4" id="add-weight-form-unit">
                    <label>Unit</label>
                    <select class="form-control" name="unit" id="unit" required>
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                    </select>
                </div>
                <div class="form-group col-md-4" id="add-weight-form-date">
                    <label>Date</label>
                    <input class="form-control" type="date" name="date" required>
                </div>
            </div>
        </div>
    `;

    // create the submit button
    const saveWeightButton = document.createElement('div');
    saveWeightButton.className = 'section-container action';
    saveWeightButton.id = 'add-weight-form-submit';
    saveWeightButton.role = 'button';
    saveWeightButton.innerHTML = '<h4> Add Weight </h4>';
    saveWeightButton.onclick = () => saveWeight();

    // assemble the form
    addWeightFormContainer.appendChild(addWeightFormTitle);
    addWeightFormContainer.appendChild(addWeightForm);
    addWeightFormContainer.appendChild(saveWeightButton);

    return addWeightFormContainer;
}

// Close add weight form
async function close_add_weight_form() {
    // hide the add weight form
    const addWeightFormContainer = document.querySelector('#add-weight-form-container');
    await addWeightFormContainer.remove();

    // show all the section-containers on the page
    const sectionContainers = document.querySelectorAll('.section-container');
    // Show each section container
    await Promise.all(Array.from(sectionContainers).map(sectionContainer => show_section(sectionContainer)));
    // open the personal info container
    openPersonalInfoContainer();

}

// save the new weight to the DB
async function saveWeight() {
    // get the form data
    const addWeightForm = document.querySelector('#add-weight-form');
    const formData = new FormData(addWeightForm);
    const weight = formData.get('weight');
    const unit = formData.get('unit');
    const date = formData.get('date');

    // if weight is not a number or blank, alert the user
    if (isNaN(weight) || weight === '') {
        alert('Please enter a valid weight');
        return
    }

    // if date is blank, alert the user 
    if (date === '') {
        alert('Please enter a valid date');
        return
    }

    // assemble the object to be submitted to DB
    const newWeight = {
        weight: weight,
        unit: unit,
        date: date,
        user: userID
    }

    // get the CSRF token
    const csrf_token = document.querySelector('meta[name="csrf_token"]').getAttribute('content');

    // send the data to the DB
    await fetch(`/${userID}/body-weights/`, {
        method: 'POST',
        body: JSON.stringify(newWeight),
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

    // hide the add weight form
    const addWeightFormContainer = document.querySelector('#add-weight-form-container');
    await addWeightFormContainer.remove();

    // Set a flag in localStorage or sessionStorage
    localStorage.setItem('openPersonalInfo', 'true');

    // reload the page
    window.location.href = `/${userID}/profile/`;
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