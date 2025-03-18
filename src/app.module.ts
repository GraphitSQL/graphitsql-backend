import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import svcConfig from './config/svc.config';
import { UserModule } from './modules/users/user.module';
import dbConfig from 'db/config/db-config';
import { HttpModule } from '@nestjs/axios';
import { EmailJSModule } from './services/emailjs/emailjs.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ProjectNodeModule } from './modules/nodes/node.module';
import { ProjectEdgeModule } from './modules/edges/edge.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorsInterceptor } from './common/interceptors';
import { NoteModule } from './modules/notes/note.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      load: [svcConfig, dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<{ database: TypeOrmModuleOptions }, true>) =>
        configService.get('database'),
    }),
    EmailJSModule,
    UserModule,
    AuthModule,
    ProjectNodeModule,
    ProjectEdgeModule,
    ProjectsModule,
    NoteModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
  ],
})
export class AppModule {}
