import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// 这些应该存储在环境变量中
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

// 创建 JWT token
export async function createToken(username: string): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

// 验证 JWT token
export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { username: string };
  } catch (error) {
    return null;
  }
}

// 验证管理员凭据
export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// 设置认证 cookie
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

// 从请求中获取认证 token
export function getAuthToken(request: NextRequest): string | undefined {
  return request.cookies.get('auth_token')?.value;
}

// 从 cookie 存储中获取认证 token
export function getAuthTokenFromCookies(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get('auth_token')?.value;
}

// 检查用户是否已认证
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = getAuthToken(request);
  if (!token) return false;
  
  const payload = await verifyToken(token);
  return !!payload;
}

// 检查服务器组件中的认证状态
export async function checkAuthStatus(): Promise<boolean> {
  const token = getAuthTokenFromCookies();
  if (!token) return false;
  
  const payload = await verifyToken(token);
  return !!payload;
}

// 清除认证 cookie
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}
