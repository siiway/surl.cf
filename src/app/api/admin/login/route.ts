import { NextRequest, NextResponse } from 'next/server';
import { createToken, setAuthCookie, verifyCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // 验证用户名和密码
    if (!username || !password) {
      return NextResponse.json(
        { error: '请提供用户名和密码' },
        { status: 400 }
      );
    }
    
    // 验证管理员凭据
    if (!verifyCredentials(username, password)) {
      return NextResponse.json(
        { error: '用户名或密码不正确' },
        { status: 401 }
      );
    }
    
    // 创建 JWT token
    const token = await createToken(username);
    
    // 创建响应
    const response = NextResponse.json(
      { success: true, message: '登录成功' },
      { status: 200 }
    );
    
    // 设置认证 cookie
    setAuthCookie(response, token);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录过程中发生错误' },
      { status: 500 }
    );
  }
}
