import morgan from 'morgan';
import { WinstonLogger } from './winstonLogger';

export const morganMiddleware = morgan(
  '{method::method, url::url, http-version::http-version, status::status, res::res[content-length], user-agent::user-agent }',
  {
    stream: {
      write: (message) => WinstonLogger.log(message.trim(), 'HTTP'),
    },
  },
);
