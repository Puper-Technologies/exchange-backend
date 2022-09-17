import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { Serializer } from 'jsonapi-serializer';
  import * as _ from 'lodash';
  import PaginationUtils from '@utils/pagination.util';
  
  @Injectable()
  export default class ResponseWrapInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((...args) => {
          const serializeOptions: any = {};
          const { data, options, collectionName, error } = args[0];

          if (data && collectionName) {
            if (data.length) {
              serializeOptions.attributes = Object.keys(_.omit(data[0], ['password']));
              // data.forEach((item: any) => {
              //   // eslint-disable-next-line no-param-reassign
              //   item.id = item._id;
              //   // eslint-disable-next-line no-param-reassign
              //   delete item._id;
              // });
            } else {
              serializeOptions.attributes = Object.keys(_.omit(data, ['password',]));
            }
            if (options) {
              serializeOptions.topLevelLinks = PaginationUtils.getPaginationLinks(
                options.location,
                options.paginationParams,
                options.totalCount,
              );
              serializeOptions.meta = { totalCount: options.totalCount };
            }

            serializeOptions.keyForAttribute = 'camelCase';
            serializeOptions.excludePrefixes = [''];
            return new Serializer(collectionName, serializeOptions).serialize(data);
          }

          return {
            data: args[0].data ?? args[0],
          };
        }),
      );
    }
  }
  