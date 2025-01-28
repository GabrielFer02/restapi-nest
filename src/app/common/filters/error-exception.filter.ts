import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const statusCode = exception.getStatus ? exception.getStatus() : 400;
    const exceptionResponse = exception.getResponse
      ? exception.getResponse()
      : {
          message: 'Error',
          statusCode,
        };

    const newDate = new Date();

    response.status(statusCode).json({
      ...exceptionResponse,
      data: new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'long',
      })
        .format(newDate)
        .toString(),
      path: host.switchToHttp().getRequest().url,
    });
  }
}
