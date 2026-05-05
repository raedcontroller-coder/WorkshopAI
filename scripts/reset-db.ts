import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando reset do banco de dados...');

  try {
    // 1. Limpar todos os votos (Permite votar novamente)
    const deletedVotes = await prisma.vote.deleteMany();
    console.log(`🧹 ${deletedVotes.count} votos removidos.`);

    // Caso queira um reset TOTAL (limpar grupos e tecnologias também), 
    // você pode descomentar as linhas abaixo:
    /*
    await prisma.technology.deleteMany();
    await prisma.group.deleteMany();
    console.log('🗑️ Grupos e Tecnologias removidos.');
    */

    console.log('✨ O banco de votos foi limpo com sucesso!');
    console.log('🚀 Agora o sistema está pronto para uma nova rodada de votação.');
    console.log('\n💡 DICA: Se estiver testando no mesmo dispositivo, lembre-se de limpar o LocalStorage do navegador (voted: true) ou usar uma aba anônima.');
  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
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
