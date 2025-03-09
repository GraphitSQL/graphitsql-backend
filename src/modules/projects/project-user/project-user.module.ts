import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectUserEntity } from './project-user.entity';
import { ProjectUserService } from './project-user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ProjectUserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('service.jwt.secret'),
        signOptions: { expiresIn: Number.MAX_SAFE_INTEGER },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ProjectUserService],
  exports: [ProjectUserService],
})
export class ProjectUserModule {}
