import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  ValidationError,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

import { QueryFailedError } from 'typeorm';
import { ValidationFailedError } from '../errors';

export const NOT_UNIQUE_DB_CODE_ERROR = '23505';
function buildFieldError(error: ValidationError) {
  if (error.children?.length) {
    return error.children.map(buildFieldError);
  }

  const description = Object.values(error.constraints ?? {})
    .join('. ')
    .trim();

  return description;
}

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        console.error(JSON.stringify(err, null, 2));

        if (err instanceof ValidationFailedError) {
          return throwError(() => new BadRequestException(buildFieldError(err.errors[0]) || 'Bad request'));
        }

        if (err instanceof ForbiddenException) {
          return throwError(() => new ForbiddenException(err.message));
        }

        if (err instanceof QueryFailedError && err.driverError.code === NOT_UNIQUE_DB_CODE_ERROR) {
          return throwError(() => new ConflictException(err.driverError.detail));
        }

        if (err instanceof Error) {
          return throwError(() => new (err.constructor as any)(err.message));
        }

        return throwError(() => new InternalServerErrorException(err?.message || 'Внутренняя ошибка сервера'));
      }),
    );
  }
}
