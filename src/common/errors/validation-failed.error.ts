import { ValidationError } from '@nestjs/common';

export class ValidationFailedError {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    this.errors = errors;
  }
}
