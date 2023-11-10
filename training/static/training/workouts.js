//---------------//
// IMPORTS       //
//---------------//

//---------------//
// CONSTANTS     //
//---------------//


//---------------//
// Start workout //
//---------------//

function start_workout(workout_plan_id) {
    console.log(`Starting workout ${workout_plan_id}`);
    window.location.href = `${userID}/workouts/${workout_plan_id}`;
}

//---------------//
// EXPORTS       //
//---------------//

export { start_workout };
