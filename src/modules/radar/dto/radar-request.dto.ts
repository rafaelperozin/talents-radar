import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsArray,
  IsEnum,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';

export enum SkillLevelEnum {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum WorkTypeEnum {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ONSITE = 'onsite',
}

export class EssentialTechnicalSkillDto {
  @IsString()
  name: string;

  @IsEnum(SkillLevelEnum)
  minLevel: SkillLevelEnum;
}

export class EssentialFiltersDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(WorkTypeEnum, { each: true })
  workType?: WorkTypeEnum[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EssentialTechnicalSkillDto)
  technicalSkills?: EssentialTechnicalSkillDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  softSkills?: string[];
}

export class WeightedTechnicalSkillDto {
  @IsString()
  name: string;

  @IsEnum(SkillLevelEnum)
  expectedLevel: SkillLevelEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;
}

export class PreferredFiltersDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightedTechnicalSkillDto)
  technicalSkills?: WeightedTechnicalSkillDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  softSkills?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(WorkTypeEnum, { each: true })
  workType?: WorkTypeEnum[];

  @IsOptional()
  @IsString()
  seniority?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

export class BonusFiltersDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightedTechnicalSkillDto)
  technicalSkills?: WeightedTechnicalSkillDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  softSkills?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(WorkTypeEnum, { each: true })
  workType?: WorkTypeEnum[];

  @IsOptional()
  @IsString()
  seniority?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

export class FiltersDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EssentialFiltersDto)
  essential?: EssentialFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferredFiltersDto)
  preferred?: PreferredFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BonusFiltersDto)
  bonus?: BonusFiltersDto;
}

export class WeightsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  preferred?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bonus?: number;
}

export class RadarRequestDto {
  @IsOptional()
  @IsUUID()
  radarId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FiltersDto)
  filters?: FiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WeightsDto)
  weights?: WeightsDto;
}
