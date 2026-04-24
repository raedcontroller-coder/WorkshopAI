import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        technologies: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar grupos' }, { status: 500 });
  }
}
