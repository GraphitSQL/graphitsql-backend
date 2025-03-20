import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { EMAIL_TEMPLATES } from './templates';

@Injectable()
export class EmailJSService {
  private readonly SERVICE_ID: string;
  private readonly USER_ID: string;
  private readonly EMAIL_LINK = 'https://api.emailjs.com/api/v1.0/email/send';
  private readonly ACCESS_TOKEN: string;

  private readonly NODE_ENV: string;

  constructor(
    private readonly logger: Logger,
    readonly configService: ConfigService,
  ) {
    this.logger = new Logger(EmailJSService.name);
    this.SERVICE_ID = configService.get<string>('service.emailjs.serviceId');
    this.USER_ID = configService.get<string>('service.emailjs.userId');
    this.ACCESS_TOKEN = configService.get<string>('service.emailjs.token');
    this.NODE_ENV = configService.get<string>('service.appEnv');
  }

  async send<T>({ templateId, templateData }: { templateId: EMAIL_TEMPLATES; templateData: T }): Promise<void> {
    // NOTE - email sender disabled for dev env
    if (this.NODE_ENV === 'development') {
      return;
    }

    try {
      const payload = {
        service_id: this.SERVICE_ID,
        template_id: templateId,
        user_id: this.USER_ID,
        template_params: templateData,
        accessToken: this.ACCESS_TOKEN,
      };

      await axios(this.EMAIL_LINK, {
        method: 'POST',
        data: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      this.logger.error('Unable to send email', e);
    }
  }
}
