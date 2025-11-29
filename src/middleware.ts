

/*
// frontend/src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

// Middleware sin lógica — solo deja pasar todo
export default function middleware(_req: NextRequest) {
    return NextResponse.next()
}

// (Opcional) Indica en qué rutas se ejecuta
export const config = {
    matcher: ['/dashboard/:path*'], // o simplemente [] si quieres que no aplique a ninguna
}



* */

// TypeScript
// archivo: `frontend/src/middleware.ts`
import { clerkMiddleware, clerkClient, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

// Matcher que detecta cualquier ruta dentro de /dashboard (incluye layout y subrutas)
// Usamos la sintaxis Next.js '/dashboard/:path*' que coincide con /dashboard y todas sus subrutas
const isProtectedRoute = createRouteMatcher(['/dashboard/:path*'])

const ALLOWED_EMAILS = new Set([
    'dennisbeltranmedify@gmail.com',
    'soporte@nativecode.cl'
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const pathname = req.nextUrl.pathname

    // LOG temporales para depuración (quitar en producción)
    try {
        // No usar JSON.stringify en Request circular
        console.log('[middleware] method=', req.method, 'pathname=', pathname)
    } catch (e) {
        // ignore
    }

    // Evitar procesar rutas públicas que podrían crear bucles
    const PUBLIC_ROUTES = new Set(['/no-access', '/sign-in', '/sign-up', '/sign-out', '/'])
    if (PUBLIC_ROUTES.has(pathname)) {
        return NextResponse.next()
    }

    // Si no es una ruta protegida, seguir
    if (!isProtectedRoute(req)) {
        return NextResponse.next()
    }

    // Estado de autenticación actual
    const { userId } = await auth()

    // 1) Si NO está autenticado → llevar a /sign-up (como pediste)
    if (!userId) {
        const signupUrl = new URL('/sign-up', req.url)
        // opcional: redirigir de vuelta después de completar el sign-up
        signupUrl.searchParams.set('redirect_url', pathname)
        return NextResponse.redirect(signupUrl)
    }

    try {
        let client: any = clerkClient as any
        if (typeof clerkClient === 'function') {
            client = await (clerkClient as any)()
        }

        const user = await client.users.getUser(userId)
        const userEmails = (user.emailAddresses || []).map((addr: any) => (addr.emailAddress || '').toLowerCase())
        const isAllowed = userEmails.some((email: string) => ALLOWED_EMAILS.has(email))

        if (!isAllowed) {
            const url = new URL('/no-access', req.url)
            return NextResponse.redirect(url)
        }

        return NextResponse.next()
    } catch (err) {
        const url = new URL('/no-access', req.url)
        return NextResponse.redirect(url)
    }

})

export const config = {
    matcher: [
        // Ejecutar middleware solo para las rutas del dashboard y sus subrutas
        '/dashboard/:path*'
    ],
}
