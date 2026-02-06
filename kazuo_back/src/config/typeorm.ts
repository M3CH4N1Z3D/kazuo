import { registerAs } from '@nestjs/config';
import { config as configDotenv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

configDotenv({ path: '.env'});
console.log(process.env.NODE_ENV)

export default registerAs('typeorm', () => {
  let config: any;
  if(process.env.NODE_ENV === 'production')
    {console.log("produccion")
      config = {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        autoLoadEntities: true,
        logging: false,
        synchronize: true,
        ssl: process.env.DB_HOST === 'localhost' ? false : {
          rejectUnauthorized: false,
        },
      };
    }
    
  else{
    console.log('llegó acá')
    config = {
      type: 'postgres',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/migrations/*{.ts,.js}'],
      autoLoadEntities: true,
      logging: false,
      synchronize: true,
      dropSchema: false,
    }
  }
  console.log('Current working directory:', process.cwd());
  return config;
});
