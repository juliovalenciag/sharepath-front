import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {

  const token = request.cookies.get('auth_token')

  const protectedRoutes = ['/viajero', '/admin-dashboard', '/perfil']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !token) {
 
    const loginUrl = new URL('/sign-in', request.url)
    
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    
    return NextResponse.redirect(loginUrl)
  }

  if (request.nextUrl.pathname.startsWith('/admin-dashboard')) {
     if (token) {
        try {
            const userData = JSON.parse(token.value);
            if(userData.role !== 'admin') {
                 return NextResponse.redirect(new URL('/viajero', request.url))
            }
        } catch (e) {
            // Si el token está corrupto o no existe, te manda directo al login
            return NextResponse.redirect(new URL('/sign-in', request.url))
        }
     }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|img).*)',
  ],
}