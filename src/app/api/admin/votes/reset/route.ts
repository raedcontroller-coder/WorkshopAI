import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar se é uma requisição autorizada (simples por cookie por enquanto, igual ao middleware)
    const session = req.cookies.get('ianeg_admin_session');
    if (!session || session.value !== 'true') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // 2. Deletar todos os votos
    await prisma.vote.deleteMany({});

    return NextResponse.json({ message: 'Todos os votos foram zerados com sucesso.' });
  } catch (error) {
    console.error('Erro ao zerar votos:', error);
    return NextResponse.json({ message: 'Erro interno ao tentar zerar os votos.' }, { status: 500 });
  }
}
