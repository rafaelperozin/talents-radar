import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TalentEntity } from './talent.entity';
import { TechnicalSkillEntity } from './technical-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TalentEntity, TechnicalSkillEntity])],
  exports: [TypeOrmModule.forFeature([TalentEntity, TechnicalSkillEntity])],
})
export class TalentModule {}
