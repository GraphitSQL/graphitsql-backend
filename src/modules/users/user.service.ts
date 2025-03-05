import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Transactional } from 'src/common/types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

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
