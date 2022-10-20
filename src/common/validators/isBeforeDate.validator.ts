import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import moment from 'moment';

@ValidatorConstraint({ name: 'isBefore', async: false })
export class IsBeforeConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    return moment(propertyValue)
      .utc()
      .isSameOrBefore(moment(args.object[args.constraints[0]]).utc());
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be before ${args.constraints[0]}`;
  }
}
