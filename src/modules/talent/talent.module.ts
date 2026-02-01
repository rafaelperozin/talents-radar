import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TalentEntity } from 'src/modules/talent/talent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TalentEntity])],
  exports: [TypeOrmModule.forFeature([TalentEntity])],
})
export class TalentModule {}
