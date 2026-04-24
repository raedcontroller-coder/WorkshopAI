import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), 'alunos.md');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const sections = content.split(/Grupo \d+/i);
  sections.shift();

  console.log(`Encontrados ${sections.length} grupos para importar...`);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    const groupName = `Grupo ${i + 1}`;
    let theme = `Tema do Grupo ${i + 1}`;
    let tools: string[] = [];
    let members: string[] = [];

    const areaIdx = lines.findIndex(l => l.toLowerCase() === 'area');
    if (areaIdx !== -1 && lines[areaIdx + 1]) {
      theme = lines[areaIdx + 1];
    } else if (lines.length > 0) {
      theme = lines[0];
    }

    const toolsStartIdx = lines.findIndex(l => l.toLowerCase() === 'ferramentas');
    const integrantsIdx = lines.findIndex(l => l.toLowerCase() === 'integrantes');

    if (toolsStartIdx !== -1) {
      const endIdx = integrantsIdx !== -1 ? integrantsIdx : lines.length;
      tools = lines.slice(toolsStartIdx + 1, endIdx);
    }

    if (integrantsIdx !== -1) {
      members = lines.slice(integrantsIdx + 1);
    }

    if (tools.length === 0) tools = ['Pendente'];

    try {
      await prisma.group.upsert({
        where: { name: groupName },
        update: {
          theme: theme,
          members: members,
          technologies: {
            set: [],
            connectOrCreate: tools.map(tool => ({
              where: { name: tool },
              create: { name: tool },
            })),
          },
        },
        create: {
          name: groupName,
          theme: theme,
          members: members,
          technologies: {
            connectOrCreate: tools.map(tool => ({
              where: { name: tool },
              create: { name: tool },
            })),
          },
        },
      });
      console.log(`✅ ${groupName} atualizado com ${members.length} alunos.`);
    } catch (error) {
      console.error(`❌ Erro ao importar ${groupName}:`, error);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
