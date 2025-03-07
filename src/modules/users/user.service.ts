import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './user.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Transactional } from 'src/common/types';
import { GetMeRequest } from './users.contracts';
import { getRepository } from 'src/common/helpers';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly datasource: DataSource,
  ) {}

  //Request handlers
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

  // Utils

  async findBy(
    data: FindOptionsWhere<UserEntity>,
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<UserEntity | null> {
    const userRepository = getRepository(activeQueryRunner ?? this.datasource, UserEntity);

    return userRepository.findOneBy(data);
  }

  async createUser(
    data: Partial<UserEntity>,
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<UserEntity | null> {
    const userRepository = getRepository(activeQueryRunner ?? this.datasource, UserEntity);
    const userData = userRepository.create(data);
    return this.usersRepository.save(userData);
  }
}
