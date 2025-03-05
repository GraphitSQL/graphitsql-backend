import { UserEntity } from 'src/modules/users/user.entity';
import { JwtPayload } from './jwt-payload.types';

export type ContextUser = UserEntity &
  JwtPayload & {
    refreshToken?: string;
  };
