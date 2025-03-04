import { Controller, UseGuards, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser } from 'src/common/types';
import { GetMeRequest } from './users.contracts';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  getMe(@CurrentUser() user: ContextUser): GetMeRequest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, email, avatarColor, about, displayName, ...rest } = user;
    return { id, email, avatarColor, about, displayName };
  }
}
