# Guia do Recrutador — Radar de Talentos

## O que é o Radar?

O Radar é uma ferramenta que **busca e ranqueia automaticamente** os talentos cadastrados com base nos requisitos de uma vaga. Você descreve o perfil que procura e o sistema devolve uma lista ordenada do candidato mais compatível ao menos compatível, com uma pontuação de 0 a 100.

---

## Como ativar um Radar

Para ativar um radar você precisa **enviar uma busca** com os critérios da vaga. O resultado chega em segundos.

A busca é dividida em **três blocos**:

| Bloco            | Para que serve                                                    |
| ---------------- | ----------------------------------------------------------------- |
| **Obrigatórios** | Define quem pode ou não entrar na lista                           |
| **Perfil ideal** | Descreve o candidato perfeito — quanto mais próximo, maior a nota |
| **Diferenciais** | Pontos extras que valorizam o candidato, mas não são exigidos     |

> Você não precisa preencher todos os campos. Preencha apenas os que importam para a vaga.

---

## Bloco 1 — Obrigatórios

Candidatos que **não atendem** qualquer critério deste bloco são descartados automaticamente e não aparecem no resultado.

### Localização

```
"country": "Brazil"
"city": "São Paulo"       ← opcional
```

Use o nome do país em inglês (ex: `"Brazil"`, `"Portugal"`). Cidade é opcional.

> A busca é **insensível a maiúsculas e acentos** — `"brazil"`, `"Brazil"` e `"BRAZIL"` encontram os mesmos candidatos. O mesmo vale para cidades: `"sao paulo"` encontra `São Paulo`.

---

### Modalidade de trabalho

```
"workType": ["remote", "hybrid", "onsite"]
```

Infome uma ou mais modalidades aceitas. O candidato precisa ter **pelo menos uma** delas como preferência.

| Valor      | Significado                    |
| ---------- | ------------------------------ |
| `"remote"` | Trabalho 100% remoto           |
| `"hybrid"` | Parte presencial, parte remoto |
| `"onsite"` | Presencial integral            |

**Exemplo — aceita remoto ou híbrido:**
```json
"workType": ["remote", "hybrid"]
```

---

**Não existe mais `maxSalary` eliminatório** — use `salary` no bloco **preferred** para controlar salary por pontuação assimétrica (ver abaixo).

---

### Habilidades técnicas mínimas

```
"technicalSkills": [
  { "name": "React", "minLevel": "intermediate" },
  { "name": "TypeScript", "minLevel": "beginner" }
]
```

O candidato deve ter **todas** as habilidades listadas com **nível igual ou superior** ao mínimo definido.

**Níveis disponíveis (do menor para o maior):**

| Nível            | Quando usar                             |
| ---------------- | --------------------------------------- |
| `"beginner"`     | Conhece o básico, já usou na prática    |
| `"intermediate"` | Usa no dia a dia com autonomia          |
| `"advanced"`     | Domina bem, resolve problemas complexos |
| `"expert"`       | Referência no assunto                   |

> Dica: Use `"beginner"` como mínimo quando a habilidade é importante mas você aceita treinar. Use `"advanced"` apenas para requisitos realmente críticos.

---

### Soft skills obrigatórios

```
"softSkills": ["comunicação", "trabalho em equipe"]
```

O candidato deve ter **todos** os soft skills listados no perfil.

> Dica: Use no máximo 2–3 soft skills obrigatórios para não restringir demais.

---

## Bloco 2 — Perfil Ideal

Candidatos que passam pelos filtros obrigatórios são pontuados com base em quão próximos estão do perfil ideal. **Quanto mais próximo, maior a nota.**

### Habilidades técnicas desejadas

```
"technicalSkills": [
  { "name": "TypeScript", "expectedLevel": "expert",        "weight": 20 },
  { "name": "Node.js",    "expectedLevel": "advanced",      "weight": 15 },
  { "name": "PostgreSQL", "expectedLevel": "intermediate",  "weight": 10 }
]
```

| Campo           | O que significa                                               |
| --------------- | ------------------------------------------------------------- |
| `name`          | Nome da habilidade                                            |
| `expectedLevel` | Nível que você considera ideal                                |
| `weight`        | Importância relativa (número livre — quanto maior, mais pesa) |

**Como funciona a nota por habilidade:**
- Candidato com nível **abaixo** do ideal → nota proporcional à diferença
- Candidato com nível **igual** ao ideal → nota máxima
- Candidato com nível **acima** do ideal → nota máxima + pequeno bônus

> Dica: Distribua os pesos (`weight`) de acordo com o que é mais crítico para a vaga. Não precisa somar 100 — o sistema normaliza automaticamente.

---

### Seniority desejada

```
"seniority": "senior"
```

A seniority usa uma **escala graduada** — candidatos próximos do nível desejado ainda recebem pontuação parcial:

| Nível        | Cargo equivalente        |
| ------------ | ------------------------ |
| `"intern"`   | Estagiário               |
| `"junior"`   | Júnior                   |
| `"mid"`      | Pleno                    |
| `"senior"`   | Sênior                   |
| `"staff"`    | Staff / Principal        |
| `"lead"`     | Liderança Técnica / Lead |
| `"manager"`  | Engineering Manager      |
| `"director"` | Diretor / VP             |

**Exemplo:** buscando `"senior"`, um candidato `"staff"` recebe 75% (1 nível acima), um `"mid"` recebe 75% (1 nível abaixo), um `"junior"` recebe 50% (2 níveis abaixo).

---

### Modalidade preferida

```
"workType": ["remote"]
```

Mesmo formato dos obrigatórios, mas aqui não elimina — apenas pontuação extra para quem combina.

---

### Budget de salário *(margens assimétricas)*

```
"salary": 15000
```

Define um **target de salário**. O sistema pontua de forma assimétrica:

| Situação                          | Efeito                                                                   |
| --------------------------------- | ------------------------------------------------------------------------ |
| Pretensão = target                | Pontuação máxima                                                         |
| Pretensão abaixo do target        | Pequena penalidade (mínimo 50%) — candidatos mais baratos são bem-vindos |
| Pretensão até 20% acima do target | Penalidade progressiva                                                   |
| Pretensão > 20% acima do target   | Pontuação zero neste critério                                            |

> Candidatos **não são eliminados** por salary — apenas perdem pontos. Configure o `weight` relativo ao salary se ele for muito ou pouco importante para a vaga.

---

### Soft skills desejados

```
"softSkills": ["liderança", "mentoria"]
```

Pontuação proporcional à quantidade de matches encontrados.

---

### Palavras-chave

```
"keywords": ["e-commerce", "startups", "produto"]
```

Busca livre no perfil completo do candidato: nome, cargo, headline, habilidades e soft skills. Útil para encontrar contextos de experiência (ex: `"fintech"`, `"B2B"`, `"micro-serviços"`).

---

## Bloco 3 — Diferenciais

Mesma estrutura do Perfil Ideal, mas com **menor peso no score final** (padrão: 20%). Use para habilidades ou experiências que são um "plus" mas não definem a escolha.

```json
"bonus": {
  "technicalSkills": [
    { "name": "Docker", "expectedLevel": "intermediate", "weight": 5 }
  ],
  "keywords": ["open source", "liderança técnica"],
  "softSkills": ["autonomia"]
}
```

---

## Configurando a Importância dos Blocos

Você pode ajustar quanto o **Perfil Ideal** e os **Diferenciais** pesam no score final:

```json
"weights": {
  "preferred": 8,
  "bonus": 2
}
```

Os valores são proporcionais (não precisa somar 10 ou 100). Exemplos:

| Cenário                                           | preferred | bonus |
| ------------------------------------------------- | --------- | ----- |
| Vaga muito técnica, diferenciais pouco relevantes | `9`       | `1`   |
| Equilíbrio padrão                                 | `7`       | `3`   |
| Diferenciais importam bastante                    | `6`       | `4`   |

> Se omitir `weights`, o sistema usa `preferred: 70%` e `bonus: 30%` por padrão.

---

## Como Ler o Resultado

```json
{
  "radarId": "abc123...",
  "talents": [
    {
      "talent": { "fullName": "Carlos Mendes", ... },
      "score": 76.7,
      "breakdown": {
        "preferred": 61.0,
        "bonus": 15.7
      }
    }
  ]
}
```

| Campo                 | O que significa                                          |
| --------------------- | -------------------------------------------------------- |
| `radarId`             | Identificador único desta busca (guarde para referência) |
| `score`               | Nota final de 0 a 100 — quanto maior, mais compatível    |
| `breakdown.preferred` | Quantos pontos vieram do perfil ideal                    |
| `breakdown.bonus`     | Quantos pontos vieram dos diferenciais                   |

> `preferred + bonus = score`

A lista já vem **ordenada do mais ao menos compatível**.

---

## Exemplos Prontos por Tipo de Vaga

### Frontend Sênior (remote)

```json
{
  "filters": {
    "essential": {
      "country": "Brazil",
      "workType": ["remote"],
      "technicalSkills": [
        { "name": "React", "minLevel": "advanced" }
      ]
    },
    "preferred": {
      "technicalSkills": [
        { "name": "React",      "expectedLevel": "expert",       "weight": 20 },
        { "name": "TypeScript", "expectedLevel": "advanced",     "weight": 15 },
        { "name": "CSS",        "expectedLevel": "advanced",     "weight": 8  }
      ],
      "seniority": "senior",
      "salary": 15000,
      "workType": ["remote"],
      "softSkills": ["comunicação", "proatividade"]
    },
    "bonus": {
      "technicalSkills": [
        { "name": "Next.js",   "expectedLevel": "intermediate", "weight": 5 },
        { "name": "Storybook", "expectedLevel": "beginner",     "weight": 3 }
      ],
      "keywords": ["design system", "performance", "acessibilidade"]
    }
  },
  "weights": { "preferred": 8, "bonus": 2 }
}
```

---

### Backend Mid (hybrid ou remote)

```json
{
  "filters": {
    "essential": {
      "country": "Brazil",
      "workType": ["remote", "hybrid"],
      "technicalSkills": [
        { "name": "Node.js",    "minLevel": "intermediate" },
        { "name": "TypeScript", "minLevel": "intermediate" }
      ]
    },
    "preferred": {
      "technicalSkills": [
        { "name": "Node.js",    "expectedLevel": "advanced",     "weight": 20 },
        { "name": "TypeScript", "expectedLevel": "advanced",     "weight": 15 },
        { "name": "PostgreSQL", "expectedLevel": "intermediate", "weight": 10 }
      ],
      "seniority": "mid",
      "salary": 12000,
      "softSkills": ["organização", "trabalho em equipe"]
    },
    "bonus": {
      "technicalSkills": [
        { "name": "Docker", "expectedLevel": "beginner", "weight": 5 }
      ],
      "keywords": ["api", "rest", "microsserviços"]
    }
  },
  "weights": { "preferred": 7, "bonus": 3 }
}
```

---

### Tech Lead (qualquer modalidade)

```json
{
  "filters": {
    "essential": {
      "country": "Brazil",
      "workType": ["remote", "hybrid", "onsite"],
      "technicalSkills": [
        { "name": "TypeScript", "minLevel": "advanced" }
      ],
      "softSkills": ["liderança"]
    },
    "preferred": {
      "technicalSkills": [
        { "name": "TypeScript", "expectedLevel": "expert",   "weight": 15 },
        { "name": "Node.js",    "expectedLevel": "expert",   "weight": 15 },
        { "name": "AWS",        "expectedLevel": "advanced", "weight": 10 }
      ],
      "seniority": "lead",
      "salary": 30000,
      "softSkills": ["liderança", "mentoria", "comunicação"]
    },
    "bonus": {
      "keywords": ["arquitetura", "squad", "tech lead", "staff"],
      "softSkills": ["tomada de decisão", "autonomia"]
    }
  },
  "weights": { "preferred": 7, "bonus": 3 }
}
```

---

## Dicas Rápidas

**Poucos resultados?**
→ Remova critérios eliminatórios menos críticos (ex: `softSkills` ou `technicalSkills` do essential) ou amplie o `workType`

**Resultados pouco diferenciados (todos com score parecido)?**
→ Aumente o número de critérios no preferred ou aumente os `weight` das habilidades mais importantes

**Candidato certo não apareceu?**
→ Verifique os campos `essential`: ele pode ter sido eliminado por localização, salário ou uma skill obrigatória

**Não sabe o nível exato de uma skill?**
→ Use `"beginner"` no essential para não eliminar candidatos desnecessariamente, e coloque o nível ideal no `preferred`

**Quer focar só no perfil técnico?**
→ Omita `salary`, `seniority` e `workType` do preferred — só os campos informados participam da pontuação
