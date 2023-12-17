// -------------------------- //
// IMPORTS                    //
// -------------------------- //

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
    weightMeasurementButton.onclick= addWeight();

    // add button to container
    weightMeasurementButtonContainer.appendChild(weightMeasurementButton);

    return weightMeasurementButtonContainer;
}

// function for adding a weight
function addWeight() {
    return
}

// Assemble Personal Information
function assemblePersonalInfo(bodyWeights) {
    const personalInfoContainer = createPersonalInfoContainer();
    const personalInfoDetails = personalInfoContainer.querySelector('#personal-info-container-content');
    personalInfoDetails.appendChild(addBodyWeightChart(bodyWeights));
    personalInfoDetails.appendChild(addWeightMeasurementButton());
    return personalInfoContainer;
}

// expand the section on dropdown arrow click
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

// contract the section on dropdown arrow click
function closePersonalInfoContainer() {
    const personalInfoDetails = document.querySelector('#personal-info-container-content');
    personalInfoDetails.style.display = 'none';
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
    return workoutNowButton;
}

// -------------------------- //
// LOAD PROFILE PAGE          //
// -------------------------- //

// Load profile page
async function loadProfilePage(userID) {
    let workouts = await fetchAllWorkouts(userID);

    let bodyWeights = await fetchBodyWeights(userID);

    document.querySelector('#profile-body-weight').append(assemblePersonalInfo(bodyWeights));
    document.querySelector('#profile-personal-bests').append(assemblePersonalBests());
    document.querySelector('#profile-workout-history').append(assembleWorkoutHistory(workouts));
    document.querySelector('#profile-page-main-action').append(createWorkoutNowButton());
    
}

// redirect to profile page
function goToProfilePage(userID) {
    window.location.href = `/${userID}/profile/`;
    
}

// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { fetchAllWorkouts, goToProfilePage };