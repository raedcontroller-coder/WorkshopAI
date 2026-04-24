import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, theme, technologies, members } = await req.json();

    // 1. Validações básicas
    if (!name || !theme || !technologies || !Array.isArray(technologies)) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }

    if (technologies.length > 3) {
      return NextResponse.json({ message: 'Máximo de 3 IAs por grupo' }, { status: 400 });
    }

    // 2. Verificar se o Tema já existe
    const existingTheme = await prisma.group.findUnique({ where: { theme } });
    if (existingTheme) {
      return NextResponse.json({ message: 'Este tema já foi escolhido por outro grupo.' }, { status: 400 });
    }

    // 3. Verificar se as IAs já foram escolhidas por outros grupos
    // Buscamos tecnologias pelo nome que já estão associadas a algum grupo
    for (const techName of technologies) {
      const existingTech = await prisma.technology.findUnique({
        where: { name: techName },
        include: { groups: true }
      });

      if (existingTech && existingTech.groups.length > 0) {
        return NextResponse.json({ message: `A IA "${techName}" já foi selecionada por outro grupo.` }, { status: 400 });
      }
    }

    // 4. Criar o Grupo e as Tecnologias (se não existirem)
    const group = await prisma.group.create({
      data: {
        name,
        theme,
        members: members || [],
        technologies: {
          connectOrCreate: technologies.map((tech: string) => ({
            where: { name: tech },
            create: { name: tech },
          })),
        },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
