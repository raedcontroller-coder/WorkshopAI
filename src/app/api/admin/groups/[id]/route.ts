import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// EDITAR GRUPO
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Correção para Next.js 15+
    const { name, theme, technologies, members } = await req.json();

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        name,
        theme,
        members: members || [],
        technologies: {
          set: [],
          connectOrCreate: technologies.map((tech: string) => ({
            where: { name: tech },
            create: { name: tech },
          })),
        },
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error: any) {
    console.error('Erro ao editar grupo:', error);
    return NextResponse.json({ message: error.message || 'Erro ao atualizar grupo' }, { status: 500 });
  }
}

// EXCLUIR GRUPO
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Correção para Next.js 15+

    await prisma.vote.deleteMany({ where: { groupId: id } });
    await prisma.group.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir grupo:', error);
    return NextResponse.json({ message: error.message || 'Erro ao excluir grupo' }, { status: 500 });
  }
}
