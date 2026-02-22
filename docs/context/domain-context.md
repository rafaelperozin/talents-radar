# Contexto Técnico Detalhado

Objetivo: fornecer contexto para geração de código consistente com o domínio.

## Propósito do Sistema

Sistema backend responsável por:

- Criar Radars associados a oportunidades
- Avaliar Talent Cards
- Aplicar filtros eliminatórios
- Calcular score proporcional
- Ranqueamento persistido
- Permitir reprocessamento incremental

## Modelo de Domínio

**Entidade**: TalentCard

Representa um talento cadastrado na base.

**Responsabilidades**:

- Armazenar dados estruturados
- Servir como base para filtros e score
- Ser reavaliado quando um Radar for executado

Exemplos de atributos:

- id
- name
- skills (array)
- seniority
- yearsOfExperience
- location
- salaryExpectation
- education
- certifications
- updatedAt

**Entidade**: Radar

Busca estruturada criada por um Hunter.

**Responsabilidades**:

- Armazenar critérios e pesos
- Definir filtros eliminatórios
- Executar avaliação
- Persistir resultados

Estrutura lógica:

- id
- opportunityId
- createdBy
- essentialCriteria[]
- preferredCriteria[]
- bonusCriteria[]
- weights
- createdAt
- updatedAt

**Entidade**: RadarCandidateScore

Tabela de resultado do processamento.

Responsabilidades:

- Persistir score calculado
- Permitir reuso
- Evitar recalcular tudo sempre

Estrutura lógica:

- id
- radarId
- talentCardId
- score
- breakdown (JSON detalhado opcional)
- processedAt

## Regras de Negócio

### 1. Filtros Eliminatórios

Se não atender → excluído antes do score.

Exemplo:

- Localização obrigatória
- Senioridade mínima
- Skill essencial obrigatória

### 2. Critérios Avaliativos

Classificados como:

- ESSENTIAL
- PREFERRED
- BONUS

### 3. Cálculo do Score

Modelo proporcional.

Pseudo-lógica:

```ts
score = (
  (essentialMatch * essentialWeight) +
  (preferredMatch * preferredWeight) +
  (bonusMatch * bonusWeight)
) / totalPossibleWeight

Score final normalizado (0–100).
```

## Processamento do Radar

Pipeline esperado:

1. Buscar TalentCards elegíveis
2. Aplicar filtros eliminatórios
3. Avaliar critérios
4. Calcular score proporcional
5. Persistir RadarCandidateScore
6. Ordenar por score desc

## Reprocessamento Incremental

O sistema deve:

- Reprocessar apenas talentos novos ou alterados
- Evitar recalcular todos os scores sempre
- Atualizar RadarCandidateScore quando:
  - TalentCard.updatedAt > RadarCandidateScore.processedAt

## Diretrizes de Código

**Arquitetura**

- Clean Architecture
- Separação de domínio e infraestrutura
- Services não devem conter lógica de persistência direta
- Use cases isolados

## Organização esperada no NestJS

```
modules/
  radar/
  talent/
  score/
```

## Princípios obrigatórios

- Nenhuma regra de negócio no controller
- Score logic isolada em domínio
- Persistência via repository
- DTOs separados de entidades

## Cuidados Importantes

- Não misturar filtros eliminatórios com score
- Não recalcular tudo desnecessariamente
- Não acoplar Radar ao TalentCard diretamente
- Sempre permitir extensibilidade de critérios
