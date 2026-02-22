# Radar de Talentos — Regras de Negócio

## O que é o Radar?

O Radar é um sistema de busca e ranqueamento de talentos. A partir de critérios definidos por uma vaga, ele filtra e ordena automaticamente os candidatos do mais ao menos compatível, retornando um **score de 0 a 100**.

---

## Como funciona

A busca funciona em duas etapas:

### 1. Filtros Eliminatórios (`essential`)

Critérios **obrigatórios**. Talentos que não atendem **qualquer um** deles são descartados e não aparecem no resultado.

| Critério           | Comportamento                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `country` / `city` | Localização (insensível a maiúsculas e acentos — `"sao paulo"` encontra `São Paulo`)                         |
| `workType`         | Aceita múltiplas modalidades — talento deve ter uma delas                                                    |
| `technicalSkills`  | *Opcional* — quando informado, talento deve ter **todas** as skills listadas com nível **igual ou superior** |
| `softSkills`       | Talento deve ter **todos** os soft skills listados                                                           |

### 2. Ranqueamento (`preferred` + `bonus`)

Talentos que passam pelos filtros são pontuados. O score final combina dois grupos de critérios com pesos configuráveis:

| Grupo       | Papel                   | Peso padrão |
| ----------- | ----------------------- | ----------- |
| `preferred` | Perfil ideal da vaga    | 70%         |
| `bonus`     | Diferenciais desejáveis | 30%         |

> Os pesos podem ser ajustados por requisição usando `weights.preferred` e `weights.bonus`.

---

## Critérios de Pontuação

### Technical Skills

Cada skill tem um **nível esperado** e um **peso individual**:

- Nível abaixo do esperado → penalidade proporcional
- Nível igual ao esperado → pontuação plena
- Nível acima do esperado → pequeno bônus (limitado)

**Níveis disponíveis (crescente):** `beginner` → `intermediate` → `advanced` → `expert`

> Se o peso individual não for informado, todas as skills valem igual.

### Salary

O salary nos filtros **preferred** e **bonus** funciona com margens assimétricas em torno de um target:

| Situação                          | Pontuação                                                           |
| --------------------------------- | ------------------------------------------------------------------- |
| Talento sem salário informado     | 50% (neutro)                                                        |
| Pretensão igual ao target         | 100%                                                                |
| Pretensão abaixo do target        | Penalidade leve — mínimo 50% (quanto mais barato, menor penalidade) |
| Pretensão até 20% acima do target | Penalidade progressiva                                              |
| Pretensão > 20% acima do target   | 0%                                                                  |

> Candidatos **não são eliminados** por salário. A gestão de salary é 100% por pontuação.
> Configure o `weight` do sub-filtro salary para dar mais ou menos importância a este critério.

### Soft Skills

Proporção de matches encontrados no perfil do talento.
Ex: pediu 3, talento tem 2 → 67%.

### Seniority

A seniority opera em uma **escala graduada** — não é mais match binário (0 ou 100%). Quanto mais distante na escala, menor o score:

| Escala     | Cargo equivalente        |
| ---------- | ------------------------ |
| `intern`   | Estagiário               |
| `junior`   | Júnior                   |
| `mid`      | Pleno                    |
| `senior`   | Sênior                   |
| `staff`    | Staff / Principal        |
| `lead`     | Liderança Técnica / Lead |
| `manager`  | Engineering Manager      |
| `director` | Diretor / VP             |

**Pontuação por distância na escala:**
- 0 níveis de distância: 100%
- 1 nível de distância: 75%
- 2 níveis de distância: 50%
- 3 níveis de distância: 25%
- 4+ níveis de distância: 0%

> Exemplo: buscando `senior`, um candidato `staff` recebe 75% em seniority (1 nível acima), e um `mid` também recebe 75% (1 nível abaixo).

### Keywords

Busca livre em: nome, cargo, headline, skills e soft skills do talento. Insensível a maiúsculas e acentos.
Proporção de keywords encontradas.
Ex: pediu 3, encontrou 2 → 67%.

---

## Pesos Padrão dos Sub-critérios

Quando não há necessidade de customização, o sistema usa estes pesos internamente:

**Preferred:**

| Critério         | Peso |
| ---------------- | ---- |
| Technical skills | 40%  |
| Soft skills      | 15%  |
| Salary           | 15%  |
| Work type        | 10%  |
| Seniority        | 10%  |
| Keywords         | 10%  |

**Bonus:**

| Critério         | Peso |
| ---------------- | ---- |
| Technical skills | 35%  |
| Soft skills      | 20%  |
| Keywords         | 15%  |
| Salary           | 10%  |
| Work type        | 10%  |
| Seniority        | 10%  |

> Apenas os critérios **enviados na request** participam da pontuação. Os pesos são renormalizados automaticamente entre os presentes.

---

## Exemplo Real — Vaga Backend Senior

### Critérios enviados

**Eliminatórios:**
- Localização: Brasil
- Modalidade: Remoto ou Híbrido
- Salário pretendido: até R$ 30.000
- Deve conhecer TypeScript (qualquer nível)

**Perfil Ideal (80% do score):**
- TypeScript expert *(peso alto)*
- Node.js avançado *(peso médio-alto)*
- PostgreSQL intermediário *(peso médio)*
- Seniority: Senior
- Modalidade preferida: Remoto
- Salário ideal: até R$ 20.000
- Soft skills: liderança, mentoria

**Diferenciais (20% do score):**
- Docker intermediário
- AWS (qualquer nível)
- Palavras-chave: distributed systems, kafka, micro
- Soft skills: arquitetura, tomada de decisão

### Resultado

| #   | Talento       | Score     | Preferred | Bonus |
| --- | ------------- | --------- | --------- | ----- |
| 1º  | Carlos Mendes | **76.7**  | 61.0      | 15.7  |
| 2º  | Rafa Silva    | **60.25** | 60.25     | 0     |
| 3º  | Marina Costa  | **42.1**  | 33.1      | 9.0   |
| 4º  | Juliana Rocha | **26.17** | 26.17     | 0     |
| ❌   | Pedro Almeida | eliminado | —         | —     |
| ❌   | Ana Lima      | eliminado | —         | —     |

### Por que cada um ficou onde ficou

**Carlos Mendes (1º — 76.7)**
TypeScript e Node.js expert (acima do esperado → bônus), Senior, remote, liderança + mentoria presentes. Salário de R$ 25k acima do budget de R$ 20k, mas dentro da tolerância de 20% → penalidade parcial. Bonus alto pela presença de Docker, AWS, arquitetura e tomada de decisão.

**Rafa Silva (2º — 60.25)**
TypeScript expert, Senior, remote, liderança + mentoria presentes e salário dentro do budget. Perdeu pontos pela ausência de Node.js e PostgreSQL (maior peso no preferred). Sem diferenciais de backend → bonus zero.

**Marina Costa (3º — 42.1)**
TypeScript advanced (abaixo de expert → penalidade), PostgreSQL advanced (acima → bônus), Mid ≠ Senior → penalidade de 1 nível em seniority, hybrid ≠ remote → zero em workType, sem liderança/mentoria. Bônus parcial pelo Docker e pelas keywords "distributed systems" e "kafka" no headline e skills.

**Juliana Rocha (4º — 26.17)**
TypeScript beginner (penalidade pesada), Junior, sem Node.js nem PostgreSQL. Salário baixo e remote são positivos, mas não compensam as ausências.

**Pedro Almeida (eliminado)**
Não possui TypeScript — descartado no filtro eliminatório.

**Ana Lima (eliminada)**
Localização: Portugal — descartada no filtro eliminatório.

---

## Customizações Disponíveis

| O que customizar                  | Como                                                            |
| --------------------------------- | --------------------------------------------------------------- |
| Importância de preferred vs bonus | `weights.preferred` e `weights.bonus` (ex: 8 e 2)               |
| Importância de cada skill técnica | `weight` em cada item de `technicalSkills`                      |
| Nível mínimo eliminatório         | `minLevel` no essential                                         |
| Nível ideal para pontuação        | `expectedLevel` no preferred/bonus                              |
| Skill aceita por apelido          | Via `variants` no cadastro do talento (ex: `"ts"` → TypeScript) |
