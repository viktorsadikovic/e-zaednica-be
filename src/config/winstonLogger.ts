import winston from 'winston';
import { utilities, WinstonModule, WinstonModuleOptions } from 'nest-winston';
// import WinstonCloudWatch from 'winston-cloudwatch';

let config: WinstonModuleOptions = null;
if (process.env.APP_ENV === 'local') {
  config = {
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      utilities.format.nestLike(),
    ),
    exitOnError: false,
    transports: [new winston.transports.Console()],
  };
} else {
  //   config = {
  //     level: 'info',
  //     format: winston.format.combine(
  //       winston.format.timestamp(),
  //       winston.format.ms(),
  //       winston.format.json(),
  //     ),
  //     exitOnError: false,
  //     transports: [
  //       new winston.transports.Console(),
  //       new WinstonCloudWatch({
  //         name: 'Cloudwatch Logs',
  //         logGroupName: 'witt-' + process.env.APP_ENV,
  //         logStreamName: function () {
  //           let date = new Date().toISOString().split('T')[0];
  //           return date;
  //         },
  //         awsRegion: 'us-east-1',
  //         jsonMessage: true,
  //       }),
  //     ],
  //   };
}

export const WinstonLogger = WinstonModule.createLogger(config);
