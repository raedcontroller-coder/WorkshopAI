import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const ranking = await prisma.group.findMany({
      include: {
        technologies: {
          select: { name: true }
        },
        _count: {
          select: { votes: true },
        },
      },
      orderBy: [
        {
          votes: {
            _count: 'desc',
          },
        },
        {
          name: 'asc',
        },
      ],
    });

    const formattedRanking = ranking.map(g => ({
      id: g.id,
      name: g.name,
      theme: g.theme,
      members: g.members,
      technologies: g.technologies,
      voteCount: g._count.votes,
    }));

    return NextResponse.json(formattedRanking);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar ranking' }, { status: 500 });
  }
}
