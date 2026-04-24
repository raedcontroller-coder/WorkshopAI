import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json({ message: 'Grupo não especificado' }, { status: 400 });
    }

    // 1. Verificação de Cookie (Primeira camada)
    const cookieStore = await cookies();
    const alreadyVoted = cookieStore.get('ianeg_voted');

    if (alreadyVoted) {
      return NextResponse.json({ message: 'Você já votou neste dispositivo.' }, { status: 403 });
    }

    // 2. Verificação de IP e User-Agent (Segunda camada)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // No PostgreSQL, buscamos se esse par já existe
    const existingVote = await prisma.vote.findFirst({
      where: {
        ipAddress: ip.split(',')[0], // Pega o IP real se estiver atrás de proxy
        userAgent: userAgent,
      },
    });

    if (existingVote) {
      return NextResponse.json({ message: 'Este dispositivo já registrou um voto.' }, { status: 403 });
    }

    // 3. Registro do Voto
    await prisma.vote.create({
      data: {
        groupId,
        ipAddress: ip.split(',')[0],
        userAgent,
      },
    });

    // 4. Configurar Cookie para dificultar novos votos
    const response = NextResponse.json({ message: 'Voto registrado!' }, { status: 200 });
    
    // Cookie expira em 30 dias
    response.cookies.set('ianeg_voted', 'true', {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro na votação:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
