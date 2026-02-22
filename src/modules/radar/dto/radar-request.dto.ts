import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';

// ───────────────────────────────────────────
// Enums / constantes reutilizáveis
// ───────────────────────────────────────────

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

// ───────────────────────────────────────────
// Essential filters — eliminatórios (AND)
// Sem pesos: é pura eliminação.
// ───────────────────────────────────────────

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
  /**
   * Opcional — use quando quiser adicionar precisão eliminatória por skill.
   * Talento que não atender TODOS os requisitos listados é descartado.
   */
  technicalSkills?: EssentialTechnicalSkillDto[]; // AND — minLevel

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  softSkills?: string[]; // AND — talento deve ter TODAS
}

// ───────────────────────────────────────────
// Preferred / Bonus — influenciam o score
// ───────────────────────────────────────────

/**
 * Cada technical skill no preferred/bonus tem:
 *  - name: nome da skill (matched com variants do talento)
 *  - expectedLevel: nível desejado (score proporcional)
 *  - weight: peso individual desta skill no sub-score (0–100)
 */
export class WeightedTechnicalSkillDto {
  @IsString()
  name: string;

  @IsEnum(SkillLevelEnum)
  expectedLevel: SkillLevelEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number; // default = peso igual entre skills
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
  softSkills?: string[]; // interseção

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number; // budget — quanto menor expectedSalary vs budget, melhor

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
  keywords?: string[]; // busca genérica em vários campos
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

// ───────────────────────────────────────────
// Filters container
// ───────────────────────────────────────────

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

// ───────────────────────────────────────────
// Weights (category-level, 0–100)
// Essential NÃO tem peso — é eliminatório.
// ───────────────────────────────────────────

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

// ───────────────────────────────────────────
// Main request DTO
// ───────────────────────────────────────────

export class RadarRequestDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FiltersDto)
  filters?: FiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WeightsDto)
  weights?: WeightsDto;
}
