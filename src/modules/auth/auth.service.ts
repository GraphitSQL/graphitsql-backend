import { EmailJSService } from './../../services/emailjs/emailjs.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from './../users/user.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthEntity } from './auth.entity';
import { UserEntity } from '../users/user.entity';
import { withTransaction } from 'src/common/helpers';
import { BuildRegistrationTokenDto, LoginDto } from './dto';
import * as crypto from 'crypto';
import { EMAIL_TEMPLATES } from 'src/services/emailjs/templates';
import { SendResetPasswordEmailData, SendVerificationEmailData } from 'src/services/emailjs/types/emails.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private credentialsRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
    private readonly userService: UserService,
    private readonly datasource: DataSource,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly emailService: EmailJSService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.validateUser(email, password);

    const tokens = await this.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<number> {
    const credentials = await this.credentialsRepository.update(
      { userId },
      {
        refreshToken: null,
      },
    );

    return credentials.affected;
  }

  async register(registrationToken: string, inputCode: string) {
    return withTransaction(this.datasource, async queryRunner => {
      const registrationData = this.getRegistrationData(registrationToken);
      const { code, email, password, avatarColor, userName } = registrationData;
      const isCodeMatch = await bcrypt.compare(inputCode, code);

      if (!isCodeMatch) {
        throw new BadRequestException('Неверный код');
      }

      const existingUser = await this.userService.findBy({ email });

      if (existingUser) {
        throw new ConflictException('Пользователь с такой почтой уже существует');
      }

      const user = await this.userService.createUser(
        {
          email,
          displayName: userName,
          avatarColor,
        },
        { queryRunner },
      );

      if (!user) {
        throw new BadRequestException('Невозможно создать юзера');
      }

      const tokens = await this.generateTokens(user);
      const hashedRefreshToken = await this.hashData(tokens.refreshToken);

      const credentials = this.credentialsRepository.create({
        userId: user.id,
        password: password,
        refreshToken: hashedRefreshToken,
      });
      await queryRunner.manager.save(AuthEntity, credentials);

      return tokens;
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const credentials = await this.credentialsRepository.findOne({
      where: { userId, user: { deletedAt: IsNull() } },
      relations: ['user'],
    });
    if (!credentials || !credentials.refreshToken) throw new UnauthorizedException('Требуется авторизация');

    const refreshTokenMatches = await bcrypt.compare(refreshToken, credentials.refreshToken);

    if (!refreshTokenMatches) throw new ForbiddenException('Доступ запрещен');

    const tokens = await this.generateTokens(credentials.user);
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async buildRegistrationToken({ password, email, ...rest }: BuildRegistrationTokenDto): Promise<string> {
    const existingUser = await this.userService.findBy({ email });

    if (existingUser) {
      throw new ConflictException('Пользователь с такой почтой уже существует');
    }

    const verifyCode = crypto.randomBytes(2).toString('hex').toUpperCase();
    this.logger.debug('verifyCode', verifyCode);
    const encryptedCode = await this.hashData(verifyCode);
    const hashedPassword = await this.hashData(password);

    const registrationToken = await this.jwtService.signAsync(
      {
        password: hashedPassword,
        code: encryptedCode,
        email,
        ...rest,
      },
      {
        secret: this.configService.get<string>('service.jwt.secret'),
        expiresIn: '15m',
      },
    );

    this.emailService.send<SendVerificationEmailData>({
      templateId: EMAIL_TEMPLATES.VERIFY_EMAIL,
      templateData: {
        verification_code: verifyCode,
        username: rest.userName,
        to_email: email,
      },
    });

    return registrationToken;
  }

  async resendVerificationCode(registrationToken: string) {
    const registrationData = this.getRegistrationData(registrationToken);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, avatarColor, userName } = registrationData;

    return this.buildRegistrationToken({ email, password, avatarColor, userName });
  }

  async buildResetPasswordToken(email: string): Promise<string> {
    const existingUser = await this.userService.findBy({ email });

    if (!existingUser) {
      throw new NotFoundException('Пользователь с такой почтой не существует');
    }

    const verifyCode = crypto.randomBytes(2).toString('hex').toUpperCase();
    this.logger.debug('resetPasswordCode', verifyCode);

    const encryptedCode = await this.hashData(verifyCode);

    const registrationToken = await this.jwtService.signAsync(
      {
        userId: existingUser.id,
        code: encryptedCode,
        email,
      },
      {
        secret: this.configService.get<string>('service.jwt.secret'),
        expiresIn: '25m',
      },
    );

    this.emailService.send<SendResetPasswordEmailData>({
      templateId: EMAIL_TEMPLATES.RESET_PASSWORD,
      templateData: {
        reset_code: verifyCode,
        username: existingUser.displayName,
        to_email: existingUser.email,
      },
    });

    return registrationToken;
  }

  async resendResetPasswordCode(registrationToken: string) {
    const registrationData = this.getResetPasswordData(registrationToken);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email } = registrationData;

    return this.buildResetPasswordToken(email);
  }

  async validateResetPasswordToken(resetPasswordToken: string, inputCode: string): Promise<void> {
    const { code } = this.getResetPasswordData(resetPasswordToken);
    const isCodeMatch = await bcrypt.compare(inputCode, code);

    if (!isCodeMatch) {
      throw new ForbiddenException('Неверный код');
    }
  }

  async setNewPassword(password: string, resetPasswordToken: string) {
    const registrationData = this.getResetPasswordData(resetPasswordToken);
    const { userId } = registrationData;

    return this.changePassword(password, userId);
  }

  async changePassword(password: string, userId: string) {
    const hashedPassword = await this.hashData(password);
    const creadentials = await this.credentialsRepository.findBy({ userId });

    if (!creadentials) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.credentialsRepository.update(
      { userId },
      {
        password: hashedPassword,
      },
    );
  }

  // Helpers

  private async validateUser(email: string, password: string): Promise<UserEntity> {
    const credentials = await this.credentialsRepository.findOne({
      where: { user: { email, deletedAt: IsNull() } },
      relations: ['user'],
    });

    if (!credentials) throw new BadRequestException('Пользователя не существует');

    const isPasswordMatches = await bcrypt.compare(password, credentials.password);

    if (!isPasswordMatches) throw new BadRequestException('Неверный пароль');

    return credentials.user;
  }

  private async generateTokens(user: UserEntity) {
    const payload = { email: user.email, sub: user.id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('service.jwt.secret'),
        expiresIn: this.configService.get<string>('service.jwt.accessExpires'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('service.jwt.secret'),
        expiresIn: this.configService.get<string>('service.jwt.refreshExpires'),
      }),
    ]);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  private async hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.credentialsRepository.update(
      { userId },
      {
        refreshToken: hashedRefreshToken,
      },
    );
  }

  private getRegistrationData(registrationToken: string): BuildRegistrationTokenDto & { code: string } {
    const registrationData = this.jwtService.decode<BuildRegistrationTokenDto & { code: string }>(registrationToken);

    return registrationData;
  }

  private getResetPasswordData(registrationToken: string) {
    const registrationData = this.jwtService.decode(registrationToken);

    return registrationData;
  }
}
