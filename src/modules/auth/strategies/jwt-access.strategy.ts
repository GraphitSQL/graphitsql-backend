import { UserService } from '../../users/user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ContextUser, JwtPayload } from '../../../common/types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('service.jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<ContextUser> {
    const user = await this.userService.findBy({ id: payload.sub });
    if (!user) throw new Error('User not found');

    return { ...payload, ...user };
  }
}
