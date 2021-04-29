const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const WorkoutsService = require('./workouts-service.js')
const workoutsRouter = express.Router()
const bodyParser = express.json()

//jobs = workouts
//week = phase
const serializeWorkout = workout => ({
    id: workout.id,
    workouttitle: xss(workout.workouttitle),
    modified: new Date(workout.modified),
    content: xss(workout.content),
    phaseId: workout.phaseId,
    workoutrating: xss(parseInt(workout.workoutrating)),
    squatsweight: xss(parseInt(workout.squatsweight)),
    benchweight: xss(parseInt(workout.benchweight)),
    deadliftweight: xss(parseInt(workout.deadliftweight))
});

// INSERT INTO workouts (workouttitle, modified, "phaseId", squatsweight, benchweight, deadliftweight, workrating, content)

workoutsRouter
    .route('/')
    .get((req, res, next) => {
        WorkoutsService.getAllWorkouts(req.app.get('db'))
        .then(workouts => {
            res.json(workouts.map(serializeWorkout));
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { content, phaseId, squatsweight, benchweight, deadliftweight, workrating, workouttitle  } = req.body
        const newWorkout = { content, phaseId, squatsweight, benchweight, deadliftweight, workrating, workouttitle  }

        for (const field of ['content', 'phaseId']) {
            if (!newWorkout[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send({
                    error: { message: `${field} is required!` }
                })
            }
        }

    WorkoutsService.insertWorkout(
        req.app.get('db'),
        newWorkout
    )
        .then(workout => {
            logger.info(`Bookmark with id ${workout.id} created.`)
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${workout.id}`))
                .json(serializeWorkout(workout))
        })
        .catch(next)
    })

    workoutsRouter
    .route('/:workout_id')

    .all((req, res, next) => {
        const { workout_id } = req.params
        WorkoutsService.getById(req.app.get('db'), workout_id)
        .then(workout => {
            if (!workout) {
                logger.error(`Workout with id ${workout_id} not found`)
                return res.status(404).json({
                    error: { message: `Workout Not Found` }
                })
            }
            res.workout = workout
            next()
        })
        .catch(next)
    })

    .get((req, res) => {
        res.json(serializeWorkout(res.workout))
    })

    .delete((req, res, next) => {
        const { workout_id } = req.params
        WorkoutService.deleteWorkout(
            req.app.get('db'),
            workout_id
        )
            .then(numRowsAffected => {
                logger.info(`Workout with id ${workout_id} deleted.`)
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(bodyParser, (req, res, next) => {
        const { name, content } = req.body;
        const updateWorkout = ( name, content )

        const numberOfValues = Object.values(updateWorkout).filter(Boolean).length
        if (numberOfValues === 0) {
            logger.error(`invalid update without required fields`)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name' or 'content'`
                }
            })
        }

        WorkoutsService.updateWorkout(
            req.app.get('db'),
            req.params.workout_id,
            updateWorkout
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = workoutsRouter