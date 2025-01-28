import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class MyExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof response === 'string'
        ? {
            message: exceptionResponse,
          }
        : (exceptionResponse as object);

    const newDate = new Date();

    response.status(statusCode).json({
      ...error,
      data: new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'long',
      })
        .format(newDate)
        .toString(),
      path: host.switchToHttp().getRequest().url,
    });
  }
}
