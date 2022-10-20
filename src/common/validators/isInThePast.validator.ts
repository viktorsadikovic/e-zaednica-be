import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import moment from 'moment';

@ValidatorConstraint({ name: 'isInThePast', async: false })
export class IsInThePastConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    const currentDate = moment().utc();
    const date = moment(propertyValue).utc();

    return date.isSameOrAfter(currentDate);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} can not be a date in the past`;
  }
}
