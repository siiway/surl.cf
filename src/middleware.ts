import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from './lib/auth';

export async function middleware(request: NextRequest) {
  // 只处理管理员页面路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 登录页面不需要认证
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // 检查用户是否已认证
    const authenticated = await isAuthenticated(request);
    
    // 如果未认证，重定向到登录页面
    if (!authenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
