export const DEFAULT_CATEGORY_WEIGHTS = {
  preferred: 70,
  bonus: 30,
} as const;

export const DEFAULT_PREFERRED_FILTER_WEIGHTS = {
  technicalSkills: 40,
  softSkills: 15,
  salary: 15,
  workType: 10,
  seniority: 10,
  keywords: 10,
} as const;

export const DEFAULT_BONUS_FILTER_WEIGHTS = {
  technicalSkills: 35,
  softSkills: 20,
  salary: 10,
  workType: 10,
  seniority: 10,
  keywords: 15,
} as const;

export const DEFAULT_SKILL_WEIGHT = 10;

export const OVER_LEVEL_FACTOR = 0.3;

export const MAX_SKILL_SCORE = 1.3;

export const SALARY_BELOW_FACTOR = 0.5;

export const SALARY_ABOVE_TOLERANCE = 0.2;

export const SENIORITY_PENALTY_PER_LEVEL = 0.25;
