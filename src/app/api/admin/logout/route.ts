import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 创建响应
    const response = NextResponse.json(
      { success: true, message: '登出成功' },
      { status: 200 }
    );
    
    // 清除认证 cookie
    clearAuthCookie(response);
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '登出过程中发生错误' },
      { status: 500 }
    );
  }
}
