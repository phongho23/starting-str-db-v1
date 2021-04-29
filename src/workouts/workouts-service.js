const WorkoutsService = {
    getAllWorkouts(knex) {
        return knex.select('*').from('workouts')
    },
    getById(knex, id) {
        return knex.from('workouts').select('*').where('id', id).first()
    },
    insertWorkout(knex, newWorkout) {
        return knex
            .insert(newWorkout)
            .into('workouts')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteWorkout(knex, id) {
        return knex('workouts')
            .where({id})
            .delete()
    },
    updateWorkout(knex, id, newWorkoutFields) {
        return knex('workouts')
            .where({id})
            .update(newWorkoutFields)
    },
}

module.exports = WorkoutsService