import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Limpar o cookie de sessão
  response.cookies.set('ianeg_admin_session', '', {
    maxAge: 0,
    path: '/',
  });

  return response;
}
