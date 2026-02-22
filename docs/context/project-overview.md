# Radar de Talentos – Projeto Aplicado

## Visão Geral

O Radar de Talentos é uma solução backend desenvolvida para permitir que um Hunter crie buscas estruturadas para identificar, pontuar e ranquear talentos com base em critérios configuráveis.

O projeto foi desenvolvido seguindo metodologia iterativa em Sprints, com fundamentação conceitual, modelagem de domínio, definição de regras de negócio e implementação técnica incremental.

## Objetivo do Projeto

Construir um sistema capaz de:

- Criar Radars associados a oportunidades específicas
- Avaliar talentos cadastrados na base
- Aplicar filtros eliminatórios e avaliativos
- Calcular score proporcional
- Classificar talentos com base em critérios ponderados
- Persistir resultados para reutilização e atualização incremental

## Conceitos Centrais do Domínio

### 1. Radar de Talentos

Entidade central da solução.

Representa uma busca estruturada criada pelo Hunter contendo:

- Preferências
- Filtros
- Pesos
- Critérios de avaliação
- Resultados de score calculados

**Características:**

- Cada Radar possui identificador único
- Pode ser salvo e reutilizado
- Permite atualização incremental quando:
- Novos talentos são adicionados
- Talent Cards são atualizados

### 2. Talent Card

Representa o perfil estruturado de um talento.

Contém dados utilizados para:

- Aplicação de filtros
- Cálculo de score
- Ranqueamento

### 3. Oportunidade

Representa o contexto da vaga associada ao Radar.

### 4. Score e Ranqueamento

O sistema utiliza:

- Score proporcional
- Classificação de critérios como:
- ESSENTIAL
- PREFERRED
- BONUS

Separação clara entre:

- Filtros eliminatórios
- Filtros avaliativos

### Arquitetura da Solução

A arquitetura foi definida na Sprint 1 com foco em:

- Clean Architecture
- Modularidade
- Separação de responsabilidades
- Pipeline de processamento do Radar

Stack atual:

- Backend: NestJS
- ORM: TypeORM
- Banco: PostgreSQL
- Infra: Docker
- Execução local: Ambiente containerizado

## Estrutura Técnica Atual

### Sprint 1 – Fundamentação e Modelagem

**Backlogs:**

- BL01 – Modelagem da Solução
- BL02 – Regras de Negócio

**Entregas:**

- Definição formal do domínio
- Arquitetura conceitual
- Regras de elegibilidade
- Lógica de score proporcional
- Classificação de critérios
- Estratégia de persistência de Radars

**Aprendizados importantes:**

- Separação entre filtros eliminatórios e avaliativos evita descartes injustos
- Score proporcional aumenta qualidade da análise
- Definição antecipada da arquitetura reduz risco técnico

### Sprint 2 – Setup Técnico e Infraestrutura

**Backlogs**:

- BL03 – Setup do Projeto
- BL04 – Persistência
- BL05 – API Base

Implementações realizadas:

**Setup**

- Criação do backend em NestJS
- Estrutura inicial de módulos
- Configuração Docker
- Ambiente local funcional

**Persistência**

- Configuração TypeORM
- Conexão PostgreSQL
- Tabelas iniciais:
- TalentCard
- Radar
- RadarCandidateScore

**API Base**

- Endpoint raiz /
- Retorno “Hello World”
- Validação da execução local

## Motor de Score (Direcionamento Futuro)

O motor deve:

1. Aplicar filtros eliminatórios
2. Avaliar critérios ponderados
3. Calcular score proporcional
4. Classificar candidatos
5. Persistir resultados para reuso

Deve permitir:

- Reprocessamento incremental
- Atualização eficiente quando dados mudam

## Pipeline Conceitual do Radar

1. Criação do Radar
2. Definição de critérios e pesos
3. Aplicação de filtros eliminatórios
4. Avaliação de critérios
5. Cálculo do score
6. Persistência do resultado
7. Ranqueamento final

## Estado Atual do Projeto

- Backend funcional
- Banco configurado
- Infra validada
- Base conceitual consolidada
- Pronto para implementação do motor de score

## Diretrizes Técnicas para Evolução

- Manter separação clara de domínio
- Evitar acoplamento entre cálculo de score e persistência
- Garantir reprocessamento incremental
- Priorizar clareza nas regras de negócio
- Manter estrutura modular no NestJS

## Entidades Principais

```
Radar
TalentCard
RadarCandidateScore
```
