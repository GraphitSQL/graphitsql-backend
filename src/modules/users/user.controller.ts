import { Controller, UseGuards, Get, Post, Body, NotFoundException, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser } from 'src/common/types';
import { GetMeResponse, UpdateMeRequest, UpdateMeResponse } from './users.contracts';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@CurrentUser() user: ContextUser): Promise<GetMeResponse> {
    return this.userService.getMe(user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Post('update')
  async updateUser(@Body() payload: UpdateMeRequest, @CurrentUser() user: ContextUser): Promise<UpdateMeResponse> {
    const res = await this.userService.updateMe(payload, user.sub);

    if (!res.affected) {
      throw new NotFoundException('Пользователь не найден');
    }

    return 'OK';
  }

  @UseGuards(AccessTokenGuard)
  @Delete('delete-account')
  async deleteAccount(@CurrentUser() user: ContextUser): Promise<UpdateMeResponse> {
    const res = await this.userService.deleteMe(user.sub);

    if (!res.affected) {
      throw new NotFoundException('Аккаунт не найден');
    }

    return 'OK';
  }
}
