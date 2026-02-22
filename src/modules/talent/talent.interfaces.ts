export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const SKILL_LEVEL_VALUES: Record<SkillLevel, number> = {
  beginner: 0.25,
  intermediate: 0.5,
  advanced: 0.75,
  expert: 1.0,
};

export type WorkType = 'remote' | 'hybrid' | 'onsite';

export const SENIORITY_ORDER = [
  'intern',
  'junior',
  'mid',
  'senior',
  'staff',
  'lead',
  'manager',
  'director',
] as const;

export type SeniorityLevel = (typeof SENIORITY_ORDER)[number];
