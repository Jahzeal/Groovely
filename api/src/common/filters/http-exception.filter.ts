import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Something went wrong on our server. Please try again later.';
    
    if (exception instanceof HttpException) {
      const resContent: any = exception.getResponse();
      if (typeof resContent === 'object' && resContent !== null) {
        if (Array.isArray(resContent.message)) {
          message = resContent.message.join(', ');
        } else {
          message = resContent.message || resContent.error || exception.message;
        }
      } else if (typeof resContent === 'string') {
        message = resContent;
      }
    } else if (exception instanceof Error) {
      console.error('Unhandled Exception:', exception);
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      error: message,
    });
  }
}
