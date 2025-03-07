import { registerAs } from '@nestjs/config';

const getConfig = () => ({
  appPort: process.env.APP_PORT,
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES,
    refreshExpires: process.env.JWT_REFRESH_EXPIRES,
  },
  emailjs: {
    serviceId: process.env.SERVICE_ID,
    userId: process.env.PUBLIC_KEY,
    token: process.env.ACCESS_TOKEN,
  },
});

export type AppConfig = ReturnType<typeof getConfig>;

export default registerAs('service', getConfig);
