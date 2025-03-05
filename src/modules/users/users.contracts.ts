import { UserEntity } from 'src/modules/users/user.entity';

export type GetMeRequest = Pick<UserEntity, 'id' | 'email' | 'about' | 'avatarColor' | 'displayName'>;
