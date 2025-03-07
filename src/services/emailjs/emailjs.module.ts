import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailJSService } from './emailjs.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailJSService, Logger],
  exports: [EmailJSService],
})
export class EmailJSModule {}
