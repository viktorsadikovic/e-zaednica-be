import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import moment from 'moment';

@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    return moment(propertyValue)
      .utc()
      .isSameOrAfter(moment(args.object[args.constraints[0]]).utc());
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be after ${args.constraints[0]}`;
  }
}
