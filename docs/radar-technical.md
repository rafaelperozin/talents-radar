# Radar — Documentação Técnica

## Visão Geral

O endpoint `POST /radar` executa um pipeline de scoring que:

1. Elimina talentos que não atendem critérios obrigatórios (**essential**)
2. Pontua os talentos restantes com base em afinidade (**preferred** + **bonus**)
3. Retorna a lista ordenada por score decrescente

---

## Arquitetura

```
RadarController
    └── RadarService
            └── ScoringPipelineService
                    ├── EssentialFilterStrategy    (etapa 1 — eliminação)
                    ├── PreferredScoringStrategy   (etapa 2 — score principal)
                    ├── BonusScoringStrategy       (etapa 2 — score secundário)
                    └── WeightNormalizer           (normalização de pesos)
```

### Módulos

| Módulo          | Responsabilidade                                 |
| --------------- | ------------------------------------------------ |
| `RadarModule`   | Controller + Service da rota `/radar`            |
| `ScoringModule` | Pipeline, strategies e defaults de scoring       |
| `TalentModule`  | Entities `TalentEntity` + `TechnicalSkillEntity` |
| `SharedModule`  | Utilitários compartilhados                       |

---

## Pipeline de Scoring

### Etapa 1 — Essential Filter (`EssentialFilterStrategy`)

Duas fases:

**1a. SQL (QueryBuilder):**
- `country` → `unaccent(LOWER(talent.country)) = unaccent(LOWER(:country))`
- `city` → `unaccent(LOWER(talent.city)) = unaccent(LOWER(:city))`
- `workType` → `talent.preferred_work_type IN (:...workTypes)`
- `softSkills` → `EXISTS (jsonb_array_elements_text + unaccent + LOWER)` para cada item (AND)

Requer a extensão PostgreSQL `unaccent` (habilitada via migration `1771462000000`).
A query usa `leftJoinAndSelect('talent.technicalSkills', 'ts')` para carregar as skills na mesma query.

**1b. In-memory (filtragem pós-query):**
- `technicalSkills` *(opcional)* → para cada skill requerida, busca match por `title` OU `variants` usando `normalizeText()` e valida `talentLevel >= minLevel` usando `SKILL_LEVEL_VALUES`

---

### Etapa 2 — Scoring

#### Score Final

```
score (0–100) = preferredMatch × wPreferred + bonusMatch × wBonus
```

`wPreferred` e `wBonus` são os pesos de categoria normalizados (soma = 1.0).

**Normalização de pesos de categoria (`WeightNormalizer.normalizeCategoryWeights`):**
- Se nenhum `weights` informado → usa `DEFAULT_CATEGORY_WEIGHTS` (`preferred: 70, bonus: 30`)
- Os valores brutos são divididos pela soma total para garantir soma = 1.0

#### Sub-scores internos (Preferred / Bonus)

Cada categoria tem sub-filtros com pesos próprios. A média ponderada dos sub-scores produz o `preferredMatch` ou `bonusMatch` (0–1).

**Normalização interna de sub-filtros (`WeightNormalizer.normalizeFilterWeights`):**
- Apenas sub-filtros **presentes na request** participam (pesos dos ausentes são descartados)
- Os pesos dos presentes são normalizados para soma = 1.0

**Pesos padrão — Preferred:**

| Sub-filtro        | Peso default |
| ----------------- | ------------ |
| `technicalSkills` | 40           |
| `softSkills`      | 15           |
| `salary`          | 15           |
| `workType`        | 10           |
| `seniority`       | 10           |
| `keywords`        | 10           |

**Pesos padrão — Bonus:**

| Sub-filtro        | Peso default |
| ----------------- | ------------ |
| `technicalSkills` | 35           |
| `softSkills`      | 20           |
| `keywords`        | 15           |
| `salary`          | 10           |
| `workType`        | 10           |
| `seniority`       | 10           |

---

### Cálculo de Score por Sub-filtro

#### `technicalSkills`

Para cada skill na request:
1. Busca match no talento por `title` OU `variants[]` (case-insensitive)
2. Calcula score por nível:

| Situação                 | Fórmula                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| Skill não encontrada     | `0`                                                                             |
| Nível abaixo do esperado | `(talentLevel / expectedLevel) × MAX_SKILL_SCORE`                               |
| Nível igual              | `1.0 × MAX_SKILL_SCORE`                                                         |
| Nível acima              | `min(1.0 + OVER_LEVEL_FACTOR × extraRatio) × MAX_SKILL_SCORE, MAX_SKILL_SCORE)` |

3. Multiplica pelo `weight` individual da skill
4. Score final = `weightedSum / (totalWeight × MAX_SKILL_SCORE)` → normalizado 0–1

**Constantes:**
```ts
SKILL_LEVEL_VALUES = { beginner: 0.25, intermediate: 0.5, advanced: 0.75, expert: 1.0 }
OVER_LEVEL_FACTOR  = 0.3   // bônus atenuado por nível extra
MAX_SKILL_SCORE    = 1.3   // cap máximo por skill
DEFAULT_SKILL_WEIGHT = 10  // peso quando não informado
```

#### `softSkills`

Proporção de matches encontrados. Usa `normalizeText()` para comparação tolerante a maiúsculas e acentos.

```
score = matched / requested.length
```

#### `salary`

Modelo assimétrico — abaixo do target penaliza menos que acima:

| Situação                                  | Fórmula                                                    |
| ----------------------------------------- | ---------------------------------------------------------- |
| Talento sem salário                       | `0.5` (neutro)                                             |
| `salary <= target`                        | `1.0 - ((target - salary) / target) × SALARY_BELOW_FACTOR` |
| `salary > target × (1 + ABOVE_TOLERANCE)` | `0`                                                        |
| Entre target e target × 1.2               | decay linear mais intenso                                  |

```ts
SALARY_BELOW_FACTOR     = 0.5   // penalidade leve abaixo (mín 0.5)
SALARY_ABOVE_TOLERANCE  = 0.2   // acima de 20% → score 0
```

#### `workType`

```
score = desired[].some(wt => wt === talent.preferredWorkType) ? 1 : 0
```

#### `seniority`

Score graduado baseado na distância na escala de senioridade:

```ts
SENIORITY_ORDER = ['intern', 'junior', 'mid', 'senior', 'staff', 'lead', 'manager', 'director']

distance = |indexDesired - indexTalent|
score = max(0, 1 - distance × SENIORITY_PENALTY_PER_LEVEL)

SENIORITY_PENALTY_PER_LEVEL = 0.25
// Ex: 1 nível de distância → 0.75 | 2 níveis → 0.50 | 4+ → 0
```

Se algum dos valores não estiver na escala, cai para match exato (0 ou 1).

#### `keywords`

Busca livre (substring) no texto concatenado de: `fullName`, `role`, `headlineTitle`, `headlineSeniority`, `country`, `city`, `preferredWorkType`, todos os `skills.title`, `skills.variants[]`, `softSkills[]`. Todo o texto é normalizado via `normalizeText()` antes da comparação.

```
score = matched / keywords.length
```

---

## Normalização de Texto

Arquivo: `src/modules/shared/utils/text-normalize.util.ts`

Usado em todas as comparações in-memory (skills, soft skills, keywords, seniority):

```ts
normalizeText('São Paulo') === normalizeText('sao paulo') // true
normalizeText('Comunicação') === normalizeText('comunicacao') // true
normalizeText('TypeScript') === normalizeText('typescript') // true
```

Nas queries SQL, a normalização usa a extensão PostgreSQL `unaccent()` + `LOWER()` dos dois lados.

---

## Modelo de Dados

### `TalentEntity` (`talents`)

| Coluna                         | Tipo          | Descrição                |
| ------------------------------ | ------------- | ------------------------ |
| `id`                           | uuid          | PK                       |
| `full_name`                    | varchar       | Nome completo            |
| `email`                        | varchar       | E-mail único             |
| `phone`                        | varchar       | Telefone                 |
| `role`                         | varchar       | Cargo/título             |
| `headline_title`               | varchar(200)  | Tagline profissional     |
| `headline_years_of_experience` | int           | Anos de experiência      |
| `headline_seniority`           | varchar(40)   | Seniority (ex: Senior)   |
| `country`                      | varchar(60)   | País                     |
| `city`                         | varchar(80)   | Cidade                   |
| `expected_salary`              | numeric(12,2) | Pretensão salarial       |
| `preferred_work_type`          | varchar(20)   | remote / hybrid / onsite |
| `soft_skills`                  | jsonb         | Array de strings         |

### `TechnicalSkillEntity` (`technical_skills`)

| Coluna      | Tipo         | Descrição                                          |
| ----------- | ------------ | -------------------------------------------------- |
| `id`        | uuid         | PK                                                 |
| `title`     | varchar(120) | Nome da skill                                      |
| `level`     | varchar(20)  | beginner / intermediate / advanced / expert        |
| `variants`  | text[]       | Aliases para matching (ex: `["ts", "typescript"]`) |
| `talent_id` | uuid         | FK → `talents.id` ON DELETE CASCADE                |

---

## Migrations

| Arquivo                                      | Descrição                                  |
| -------------------------------------------- | ------------------------------------------ |
| `1769951750527-create-talents`               | Schema inicial                             |
| `1771459200000-add-radar-and-talent-fields`  | Campos de radar                            |
| `1771459300000-add-talent-structured-fields` | Campos estruturados                        |
| `1771460000000-simplify-talent-fields`       | Simplificação do modelo                    |
| `1771462000000-enable-unaccent`              | Habilita extensão `unaccent` do PostgreSQL |
| `1771462000000-enable-unaccent`              | Habilita extensão `unaccent` do PostgreSQL |

---

## Comandos Úteis

```bash
# Subir ambiente
docker compose up -d

# Rodar migrations
docker compose run --rm api npx typeorm-ts-node-commonjs migration:run -d database/data-source.ts

# Resetar e re-seedar talentos
docker compose run --rm api npx ts-node -e "
  const ds = require('./database/data-source').default;
  ds.initialize().then(() => ds.query('TRUNCATE talents CASCADE')).then(() => ds.destroy());
"
docker compose run --rm api corepack yarn seed:talents

# Verificar tipagem
npx tsc --noEmit
```
