import 'dotenv/config';
import { DataSource } from 'typeorm';
import { validateEnvironment } from '../config/environment.validation';

const config = validateEnvironment(process.env);

export default new DataSource({
    type: 'postgres',
    ...(config.DATABASE_URL
        ? { url: config.DATABASE_URL }
        : {
              host: config.DATABASE_HOST,
              port: config.DATABASE_PORT,
              username: config.DATABASE_USER,
              password: config.DATABASE_PASSWORD,
              database: config.DATABASE_NAME,
          }),
    ssl: config.DATABASE_SSL
        ? { rejectUnauthorized: config.DATABASE_SSL_REJECT_UNAUTHORIZED }
        : false,
    entities: [__dirname + '/../**/*.entity{.js,.ts}'],
    migrations: [__dirname + '/migrations/*{.js,.ts}'],
});
