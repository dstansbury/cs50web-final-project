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
            console.log('Body weights fetched successfully:', bodyWeights);
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
        </div>
    `;
    return personalInfoContainer;
}   

// Load body weights into container
function addBodyWeightChart(bodyWeights) {
    const ctx = document.createElement('canvas');
    ctx.className = 'chart';
    ctx.id = 'body-weight-chart';

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
    weightMeasurementButton.onClick= addWeight();

    // add button to container
    weightMeasurementButtonContainer.appendChild(weightMeasurementButton);

    return weightMeasurementButtonContainer;
}

// function for adding a weight
function addWeight() {
    // hide the Add weight button
    let buttonContainer = document.querySelector('#weight-measurement-button-container');
    console.log('buttonContainer is: ', buttonContainer);

    // create a div for the form
    // const weightMeasurementFormContainer = document.createElement('div');
    // weightMeasurementFormContainer.className = 'form-container';
    // weightMeasurementFormContainer.id = 'weight-measurement-container';

    console.log('Add Weight button clicked')

}

// Assemble Personal Information
function assemblePersonalInfo(bodyWeights) {
    const personalInfoContainer = createPersonalInfoContainer();
    personalInfoContainer.appendChild(addBodyWeightChart(bodyWeights));
    personalInfoContainer.appendChild(addWeightMeasurementButton());
    return personalInfoContainer;
}

// -------------------------- //
// Workout History            //
// -------------------------- //

// Fetch workouts
function fetchAllWorkouts(userID) {
    return fetch(`/${userID}/workouts`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(workouts => {
            console.log('Workouts fetched successfully:', workouts);
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
        </div>
        <div class="section-content" id="workout-history-container-content">
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
    console.log('Show more workouts button clicked');
}


// Assemble Workout History
function assembleWorkoutHistory(workouts) {
    const workoutHistoryContainer = createWorkoutHistoryContainer();
    // Check if there are more than 2 workouts, and slice the array to get the most recent five
    const lastFiveWorkouts = workouts.length > 2 ? workouts.slice(-2) : workouts;
    for (const workout of lastFiveWorkouts){
        workoutHistoryContainer.appendChild(addWorkout(workout));
    }
    workoutHistoryContainer.appendChild(addShowMoreButton());
    return workoutHistoryContainer;
}

// -------------------------- //
// LOAD PROFILE PAGE          //
// -------------------------- //

// Load profile page
async function loadProfilePage(userID) {
    let workouts = await fetchAllWorkouts(userID);
    console.log('Workouts are: ', workouts);

    let bodyWeights = await fetchBodyWeights(userID);
    console.log('Body weights are: ', bodyWeights);

    document.querySelector('#profile-body-weight').append(assemblePersonalInfo(bodyWeights));
    document.querySelector('#profile-workout-history').append(assembleWorkoutHistory(workouts));
    
}

// redirect to profile page
function goToProfilePage(userID) {
    window.location.href = `/${userID}/profile/`;
    
}

// -------------------------- //
// EXPORTS                    //
// -------------------------- //

export { fetchAllWorkouts, goToProfilePage };