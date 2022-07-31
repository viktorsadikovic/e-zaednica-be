import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

interface ClassConstructor {
  new (...args: any[]): any;
}

interface ResponseObject {
  data: any;
  currentPage?: number;
  nextPage?: number;
  perPage?: number;
  total?: number;
}

// decorator
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((res: any) => {
        const resObject: ResponseObject = {
          data: plainToInstance(this.dto, JSON.parse(JSON.stringify(res.data)), {
            excludeExtraneousValues: true,
          }),
        };
        return resObject;
      }),
    );
  }
}
