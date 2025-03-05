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
  async getMe(@CurrentUser() user: ContextUser): Promise<GetMeRequest> {
    return this.userService.getMe(user.sub);
  }
}
