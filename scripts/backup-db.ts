import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Iniciando backup dos dados do banco...');

  try {
    const groups = await prisma.group.findMany();
    const technologies = await prisma.technology.findMany();
    const votes = await prisma.vote.findMany();

    const backupData = {
      groups,
      technologies,
      votes,
      exportedAt: new Date().toISOString(),
    };

    const filePath = path.join(process.cwd(), 'database-backup.json');
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

    console.log(`✅ Backup concluído com sucesso!`);
    console.log(`📄 Arquivo salvo em: ${filePath}`);
    console.log(`📊 Total de registros:
      - Grupos: ${groups.length}
      - Tecnologias: ${technologies.length}
      - Votos: ${votes.length}`);

  } catch (error) {
    console.error('❌ Erro durante o backup:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
