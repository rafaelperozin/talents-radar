# DOCUMENTO ARQUITETURAL (ADR STYLE)

Objetivo: documentar decisões técnicas formais.

## ADR-001 – Escolha de Arquitetura

**Decisão**

Utilizar Clean Architecture com separação clara entre:
- Domínio
- Aplicação
- Infraestrutura
- Interface

**Motivo**

- Isolamento da lógica de score
- Testabilidade
- Independência de framework
- Facilidade de evolução

## ADR-002 – Stack Backend

**Decisão**

- NestJS como framework
- TypeORM como ORM
- PostgreSQL como banco relacional
- Docker para ambiente local

**Motivo**

- Modularidade forte
- Suporte a injeção de dependência
- Estrutura escalável
- Facilidade de migração e versionamento

## ADR-003 – Persistência de Score

**Decisão**

Persistir resultado de score na entidade RadarCandidateScore.

**Motivo**

- Evitar reprocessamento total
- Permitir reuso
- Melhor performance
- Histórico de processamento

## ADR-004 – Separação de Filtros e Avaliação

**Decisão**

Implementar dois estágios distintos:

1. Filtros eliminatórios
2. Avaliação proporcional

**Motivo**

- Evitar descarte injusto
- Clareza nas regras
- Melhor governança de critérios

## ADR-005 – Score Proporcional

**Decisão**

Utilizar score normalizado baseado em pesos.

**Motivo**

- Flexibilidade
- Comparabilidade entre radars
- Escalabilidade de critérios

## ADR-006 – Reprocessamento Incremental

**Decisão**

Reprocessar apenas quando:

TalentCard.updatedAt > RadarCandidateScore.processedAt

**Motivo**

- Performance
- Escalabilidade
- Redução de custo computacional

## ADR-007 – Modularização

**Decisão**

Separar módulos:

- Talent
- Radar
- Score

**Motivo**

- Baixo acoplamento
- Evolução independente
- Organização clara do domínio

## Princípios Arquiteturais

- Single Responsibility
- Open/Closed Principle
- Baixo acoplamento
- Alta coesão
- Persistência desacoplada do domínio
- Lógica de score isolada
