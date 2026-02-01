import 'dotenv/config';
import AppDataSource from './data-source';
import { TalentEntity } from '../src/modules/talent/talent.entity';

async function main() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(TalentEntity);

  const count = await repo.count();
  if (count > 0) {
    console.log(`Talents already exist (${count}). Skipping seed.`);
    await AppDataSource.destroy();
    return;
  }

  await repo.insert([
    {
      fullName: 'Rafa Silva',
      email: 'rafa.silva@fake.dev',
      role: 'Frontend Engineer',
      seniority: 'Senior',
      headline: 'React/TS, performance, DX',
    },
    {
      fullName: 'Marina Costa',
      email: 'marina.costa@fake.dev',
      role: 'Backend Engineer',
      seniority: 'Mid',
      headline: 'NestJS, Postgres, distributed systems',
    },
    {
      fullName: 'Ana Lima',
      email: 'ana.lima@fake.dev',
      role: 'Product Designer',
      seniority: 'Senior',
      headline: 'UX, systems, research',
    },
  ]);

  console.log('Seeded talents ✅');
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
