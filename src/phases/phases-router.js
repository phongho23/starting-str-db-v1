const path = require('path')
const express = require('express')
const logger = require('../logger')
const PhasesService = require('./phases-service.js')
const { getPhaseValidationError } = require('./phases-validator')
const xss = require('xss')

const phasesRouter = express.Router()
const bodyParser = express.json()

const serializePhase = phase => ({
    id: phase.id,
    name: xss(phase.name)
});

phasesRouter
    .route('/')
    .get((req, res, next) => {
        PhasesService.getAllPhases(req.app.get('db'))
        .then(phases => {
            res.json(phases.map(serializePhase))
        })
        .catch(next)
    })

    .post(bodyParser, (req, res, next) => {
        const { name } = req.body
        const newPhase = { name };

    for (const field of ['name']) {
        if (!newPhase[field]) {
            logger.error(`${field} is required`)
            return res.status(400).send({
                error: { message: `'${field}' is required` }
            })
        }
    }

    const error = getPhaseValidationError(newPhase)

    if (error) return res.status(400).send(error)

    PhasesService.insertPhase(
        req.app.get('db'),
        newPhase
    )
        .then(phase => {
            logger.info(`Phase with id ${phase.id} created`)
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${phase.id}`))
                .json(serializePhase(phase))
        })
        .catch(next);
    });

    phasesRouter
        .route('/:phase_id')
        .all((req, res, next) => {
            PhasesService.getById(req.app.get('db'), req.params.phase_id)
                .then(phase => {
                    if (!phase) {
                        return res.status(404).json({
                            error: { message: 'Phase Not Found!'}
                        })
                    }
                    res.phase = phase;
                    next();
                })
                .catch(next);
        })
        .get((req, res, next) => {
            res.json(serializePhase(res.phase));
        })
        .delete((req, res, next) => {
            PhasesService.deletePhase(req.app.get('db'), req.params.phase_id)
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next)
        })
        .patch(bodyParser, (req, res, next) => {
            const { name } = req.body;
            const phaseToUpdate = { name }

            const numberOfValues = Object.values(phaseToUpdate).filter(Boolean).length
            if (numberOfValues === 0) {
                logger.error(`Invalid without required field`)
                return res.status(400).json({
                    error: {
                        message: `Request body must contain name`
                    }
                })
            }
            const error = getPhaseValidationError(phaseToUpdate)
            if (error) return res.status(400).send(error)
    
            PhasesService.updatePhase(
                req.app.get('db'),
                req.params.phase_id,
                phaseToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
            })
        
        module.exports = phasesRouter;