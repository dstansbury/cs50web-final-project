// -------------------------- //
// IMPORTS                    //
// -------------------------- //


// -------------------------- //
// FUNCTIONS                  //
// -------------------------- //

// -------------------------- //
// Personal Information       //
// -------------------------- //

// -------------------------- //
// Workout History            //
// -------------------------- //

// Fetch workouts
function fetchAllWorkouts(userID) {
    return fetch(`/${userID}/workouts/`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
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
// Load workouts

// -------------------------- //
// EXPORTS                    //
// -------------------------- //