import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Transactional } from 'src/common/types';
import { GetMeRequest } from './users.contracts';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getMe(id: string): Promise<GetMeRequest> {
    return this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        displayName: true,
        avatarColor: true,
        about: true,
        email: true,
      },
    });
  }

  async findBy(
    data: FindOptionsWhere<UserEntity>,
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<UserEntity | null> {
    if (activeQueryRunner?.manager) {
      return activeQueryRunner?.manager.findOneBy(UserEntity, data);
    } else {
      return this.usersRepository.findOneBy(data);
    }
  }

  async createUser(
    data: Partial<UserEntity>,
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<UserEntity | null> {
    const userData = this.usersRepository.create(data);

    if (activeQueryRunner?.manager) {
      return activeQueryRunner?.manager.save(UserEntity, userData);
    } else {
      return this.usersRepository.save(userData);
    }
  }
}
