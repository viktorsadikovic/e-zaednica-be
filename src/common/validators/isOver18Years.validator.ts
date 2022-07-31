import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import moment from 'moment';

@ValidatorConstraint({ name: 'IsOver18Years', async: false })
export class IsOver18Years implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    return moment().diff(propertyValue, 'years') >= 18;
  }

  defaultMessage(args: ValidationArguments) {
    return `User must be at least 18 years old.`;
  }
}
