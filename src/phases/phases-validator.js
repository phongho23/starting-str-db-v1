const logger = require('../logger')

const NO_ERRORS = null

function getPhaseValidationError({ name }) {

  if (name.length === 0) {
    logger.error(`Phase must have a value`)
    return {
      error: {
        message: `Phase must have a value`
      }
    }
  }
  return NO_ERRORS
}

module.exports = {
  getPhaseValidationError,
}

