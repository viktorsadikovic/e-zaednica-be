import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    let message: string[] | string = exception.message || null;
    if (statusCode === 400 && exception.getResponse()['message']) {
      message = exception.getResponse()['message'];
    }
    if (typeof message === 'string') {
      message = [message];
    }

    const body = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      endpoint: request.url,
    };

    if (exception.getResponse()) {
      body['response'] = exception.getResponse();
    }

    this.logger.warn(`{message: '${message}', statusCode: '${statusCode}'}`);

    response.status(statusCode).json(body);
  }
}
