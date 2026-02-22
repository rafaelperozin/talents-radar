import 'dotenv/config';
import AppDataSource from './data-source';
import { TalentEntity } from '../src/modules/talent/talent.entity';
import { TechnicalSkillEntity } from '../src/modules/talent/technical-skill.entity';
import type { SkillLevel } from '../src/modules/talent/talent.interfaces';

async function main() {
  await AppDataSource.initialize();
  const talentRepo = AppDataSource.getRepository(TalentEntity);

  const count = await talentRepo.count();
  if (count > 0) {
    console.log(`Talents already exist (${count}). Skipping seed.`);
    await AppDataSource.destroy();
    return;
  }

  // Insere talentos (sem skills — relação cascade via save)
  const talents = talentRepo.create([
    {
      fullName: 'Rafa Silva',
      email: 'rafa.silva@fake.dev',
      phone: '+55 11 99999-0001',
      role: 'Frontend Engineer',
      headlineTitle: 'React/TS specialist, performance, DX',
      headlineYearsOfExperience: 8,
      headlineSeniority: 'senior',
      country: 'Brazil',
      city: 'São Paulo',
      expectedSalary: 18000,
      preferredWorkType: 'remote',
      technicalSkills: skillEntities([
        { title: 'React', level: 'expert', variants: ['reactjs', 'react.js'] },
        { title: 'TypeScript', level: 'expert', variants: ['ts'] },
        { title: 'Next.js', level: 'advanced', variants: ['nextjs'] },
        { title: 'GraphQL', level: 'intermediate', variants: [] },
        { title: 'Storybook', level: 'intermediate', variants: [] },
        {
          title: 'CSS',
          level: 'advanced',
          variants: ['css3', 'tailwind', 'styled-components'],
        },
      ]),
      softSkills: ['liderança', 'comunicação', 'mentoria', 'proatividade'],
    },
    {
      fullName: 'Marina Costa',
      email: 'marina.costa@fake.dev',
      phone: '+55 21 98888-0002',
      role: 'Backend Engineer',
      headlineTitle: 'NestJS, Postgres, distributed systems',
      headlineYearsOfExperience: 4,
      headlineSeniority: 'mid',
      country: 'Brazil',
      city: 'Rio de Janeiro',
      expectedSalary: 12000,
      preferredWorkType: 'hybrid',
      technicalSkills: skillEntities([
        { title: 'NestJS', level: 'advanced', variants: ['nest'] },
        { title: 'TypeScript', level: 'advanced', variants: ['ts'] },
        {
          title: 'PostgreSQL',
          level: 'advanced',
          variants: ['postgres', 'pg'],
        },
        { title: 'Docker', level: 'intermediate', variants: [] },
        { title: 'Kafka', level: 'beginner', variants: [] },
      ]),
      softSkills: [
        'trabalho em equipe',
        'organização',
        'resolução de problemas',
      ],
    },
    {
      fullName: 'Ana Lima',
      email: 'ana.lima@fake.dev',
      phone: '+351 91 000-0003',
      role: 'Product Designer',
      headlineTitle: 'UX, design systems, research',
      headlineYearsOfExperience: 6,
      headlineSeniority: 'senior',
      country: 'Portugal',
      city: 'Lisboa',
      expectedSalary: 4500,
      preferredWorkType: 'onsite',
      technicalSkills: skillEntities([
        { title: 'Figma', level: 'expert', variants: ['figma design'] },
        {
          title: 'Design Systems',
          level: 'advanced',
          variants: ['design-systems', 'component library'],
        },
        {
          title: 'UX Research',
          level: 'expert',
          variants: ['ux-research', 'pesquisa com usuário'],
        },
        { title: 'Prototyping', level: 'advanced', variants: ['prototipagem'] },
      ]),
      softSkills: [
        'empatia',
        'pensamento crítico',
        'apresentação',
        'colaboração',
      ],
    },
    {
      fullName: 'Carlos Mendes',
      email: 'carlos.mendes@fake.dev',
      phone: '+55 11 97777-0004',
      role: 'Fullstack Engineer',
      headlineTitle: 'React, Node, AWS, Terraform',
      headlineYearsOfExperience: 10,
      headlineSeniority: 'staff',
      country: 'Brazil',
      city: 'São Paulo',
      expectedSalary: 25000,
      preferredWorkType: 'remote',
      technicalSkills: skillEntities([
        { title: 'React', level: 'expert', variants: ['reactjs'] },
        { title: 'Node.js', level: 'expert', variants: ['nodejs', 'node'] },
        { title: 'TypeScript', level: 'expert', variants: ['ts'] },
        {
          title: 'AWS',
          level: 'advanced',
          variants: ['amazon web services', 'cloud aws'],
        },
        {
          title: 'Terraform',
          level: 'intermediate',
          variants: ['iac', 'infra as code'],
        },
        { title: 'GraphQL', level: 'advanced', variants: [] },
        { title: 'Docker', level: 'advanced', variants: [] },
      ]),
      softSkills: [
        'liderança',
        'arquitetura',
        'tomada de decisão',
        'mentoria',
        'comunicação',
      ],
    },
    {
      fullName: 'Juliana Rocha',
      email: 'juliana.rocha@fake.dev',
      phone: '+55 31 96666-0005',
      role: 'Frontend Engineer',
      headlineTitle: 'React, CSS, accessibility',
      headlineYearsOfExperience: 2,
      headlineSeniority: 'junior',
      country: 'Brazil',
      city: 'Belo Horizonte',
      expectedSalary: 5000,
      preferredWorkType: 'remote',
      technicalSkills: skillEntities([
        { title: 'React', level: 'intermediate', variants: ['reactjs'] },
        { title: 'CSS', level: 'intermediate', variants: ['css3', 'tailwind'] },
        { title: 'TypeScript', level: 'beginner', variants: ['ts'] },
        { title: 'Storybook', level: 'beginner', variants: [] },
        {
          title: 'Accessibility',
          level: 'intermediate',
          variants: ['a11y', 'acessibilidade'],
        },
      ]),
      softSkills: ['curiosidade', 'aprendizado rápido', 'trabalho em equipe'],
    },
    {
      fullName: 'Pedro Almeida',
      email: 'pedro.almeida@fake.dev',
      phone: '+55 11 95555-0006',
      role: 'E-commerce Developer',
      headlineTitle: 'Magento, Shopify, lojas virtuais',
      headlineYearsOfExperience: 7,
      headlineSeniority: 'senior',
      country: 'Brazil',
      city: 'São Paulo',
      expectedSalary: 16000,
      preferredWorkType: 'remote',
      technicalSkills: skillEntities([
        {
          title: 'Magento',
          level: 'expert',
          variants: [
            'magento 2',
            'adobe commerce',
            'ecommerce',
            'loja virtual',
            'e-commerce',
          ],
        },
        { title: 'PHP', level: 'expert', variants: ['php8'] },
        { title: 'Shopify', level: 'advanced', variants: ['shopify plus'] },
        { title: 'MySQL', level: 'advanced', variants: ['mariadb'] },
        { title: 'React', level: 'intermediate', variants: ['reactjs'] },
        { title: 'Docker', level: 'intermediate', variants: [] },
      ]),
      softSkills: ['foco no cliente', 'resolução de problemas', 'autonomia'],
    },
  ]);

  // save() para disparar cascade e inserir skills junto
  await talentRepo.save(talents);

  console.log('Seeded talents ✅');
  await AppDataSource.destroy();
}

/** Helper para criar instâncias parciais de TechnicalSkillEntity */
function skillEntities(
  skills: { title: string; level: SkillLevel; variants: string[] }[],
): TechnicalSkillEntity[] {
  const skillRepo = AppDataSource.getRepository(TechnicalSkillEntity);
  return skills.map((s) => skillRepo.create(s));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
