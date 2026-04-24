import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        technologies: {
          select: { name: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ message: 'Grupo não encontrado' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar grupo' }, { status: 500 });
  }
}
