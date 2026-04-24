import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    console.log(`[API Login] Tentativa de acesso para o usuário: ${username}`);

    const validUser = process.env.ADMIN_USER;
    const validPassword = process.env.ADMIN_PASSWORD;

    console.log(`[API Login] Comparando com envs: USER=${validUser}, PASS=${validPassword ? '****' : 'UNDEFINED'}`);

    if (username === validUser && password === validPassword) {
      const response = NextResponse.json({ success: true });
      
      // Cookie de sessão simples (expira em 24h)
      response.cookies.set('ianeg_admin_session', 'true', {
        httpOnly: true,
        secure: false, // Permitir em HTTP para testes no sslip.io
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro no servidor' }, { status: 500 });
  }
}
