import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSerializeType } from '../decorators/serialization.decorator';
@Injectable()
export default class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((args) => {
        const SerializeType = getSerializeType(context.getHandler());
        const entity = new SerializeType();
        // console.log("in serialize", Object.keys(args).filter(key => key in entity).forEach(key => entity[key] = args[key]))
        return Object.assign(entity, args);
        // return Object.keys(entity)
        // .reduce((a, key) => ({ ...a, [key]: args[key]}), {});
      }),
    );
  }
}
