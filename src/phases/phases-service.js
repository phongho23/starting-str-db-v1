const PhasesService = {
    getAllPhases(knex) {
        return knex.select('*').from('phases');
    },
    getById(knex, id) {
        return knex.from('phases').select('*').where('id', id).first()
    },
    insertPhase(knex, newPhase) {
        return knex
            .insert(newPhase)
            .into('phases')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deletePhase(knex, id) {
        return knex('phases')
            .where({id})
            .delete()
    },
    updatePhase(knex, id, newPhase) {
        return knex('phases')
        .where({ id })
        .update(newPhaseFields)
    },
}
      
module.exports = PhasesService;