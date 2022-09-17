import { BadRequestException, ValidationError } from '@nestjs/common';
import { MyLogger } from '@shared/logger/logger.service';

function transform(errors: ValidationError[]) {
  const logger = new MyLogger()
  logger.error(`Validation errors handled in ValidationExceptions`)
  return errors.map((error) => {
    logger.error(`"${error.property}" property has validation error: ${JSON.stringify(error.constraints)}`)
    return {
      detail: `${error.property} validation error`,
      source: { pointer: `data/attributes/${error.property}` },
      meta: error.constraints ? Object.values(error.constraints) : null,
    };
  });
}

export default class ValidationExceptions extends BadRequestException {
  constructor(public validationErrors: ValidationError[]) {
    super({ errorType: 'ValidationError', errors: transform(validationErrors) });
  }
}
