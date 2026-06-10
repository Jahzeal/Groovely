import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector = new Reflector()) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const responseMessage = this.reflector.get<string>(
      'response_message',
      context.getHandler(),
    ) || 'Operation successful';

    return next.handle().pipe(
      map((data) => {
        // If data is already in custom format or empty response, handle it
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        
        // Handle redirect flows or raw responses (like passport login redirect)
        const httpResponse = context.switchToHttp().getResponse();
        if (httpResponse.headersSent) {
          return data;
        }

        return {
          success: true,
          message: responseMessage,
          data: data === undefined ? null : data,
        };
      }),
    );
  }
}
