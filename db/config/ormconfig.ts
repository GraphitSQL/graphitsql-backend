import { ConfigModule } from '@nestjs/config';

import { DataSource } from 'typeorm';

import dbConfig from './db-config';

ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
  load: [dbConfig],
});

export default new DataSource(dbConfig());
