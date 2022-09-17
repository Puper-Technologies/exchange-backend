import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { MyLogger } from '@shared/logger/logger.service';

// @Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const logger = new MyLogger()
    return value.map((error) => {
        logger.error(`"${error.property}" property has validation error: ${JSON.stringify(error.constraints)}`)
        return {
          detail: `${error.property} validation error`,
          source: { pointer: `data/attributes/${error.property}` },
          meta: error.constraints ? Object.values(error.constraints) : null,
        };
      });
  }
}