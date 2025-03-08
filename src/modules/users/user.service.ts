import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './user.entity';
import { DataSource, FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { Transactional } from 'src/common/types';
import { GetMeResponse } from './users.contracts';
import { getRepository } from 'src/common/helpers';
import { UpdateMeDto } from './dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly datasource: DataSource,
  ) {}

  //Request handlers
  async getMe(id: string): Promise<GetMeResponse> {
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

  async updateMe(data: UpdateMeDto, id: string): Promise<UpdateResult> {
    return this.usersRepository.update({ id }, data);
  }

  async deleteMe(id: string): Promise<UpdateResult> {
    return this.usersRepository.softDelete({ id });
  }

  // Utils

  async findBy(
    data: FindOptionsWhere<UserEntity>,
    { queryRunner: activeQueryRunner }: Transactional = {},
  ): Promise<UserEntity | null> {
    const userRepository = getRepository(activeQueryRunner ?? this.datasource, UserEntity);

    return userRepository.findOne({
      where: data,
      withDeleted: false,
    });
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
