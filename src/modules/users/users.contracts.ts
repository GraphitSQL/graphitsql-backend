import { UserEntity } from 'src/modules/users/user.entity';
import { UpdateMeDto } from './dtos';
import { RequestResult } from 'src/common/types';

export type GetMeResponse = Pick<UserEntity, 'id' | 'email' | 'about' | 'avatarColor' | 'displayName'>;

export class UpdateMeRequest extends UpdateMeDto {}
export type UpdateMeResponse = RequestResult;
