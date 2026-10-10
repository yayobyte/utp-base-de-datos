import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage/HomePage'
import { NotFound } from '@/features/shared/NotFound/NotFound'
import { UiShowcase } from '@/features/ui-showcase/UiShowcase'
import { AppShell } from '@/layout/AppShell/AppShell'
import { EXAM_POINTS } from '@/layout/navigation'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell points={EXAM_POINTS} />,
    children: [
      { index: true, element: <HomePage points={EXAM_POINTS} /> },
      {
        // El punto 1 tiene su propio layout y navegación; la acción activa va en la URL (/punto-1/est-resumen…).
        path: 'punto-1/*',
        lazy: () => import('@/features/punto1/Punto1Layout/Punto1Layout').then((m) => ({ Component: m.Punto1Layout })),
      },
      {
        path: 'punto-2',
        // Carga diferida: supabase-js y la página del punto 2 solo se descargan al entrar.
        lazy: () => import('@/features/punto2/Punto2Page/Punto2Page').then((m) => ({ Component: m.Punto2Page })),
      },
      {
        path: 'punto-3',
        lazy: () => import('@/features/punto3/Punto3Page/Punto3Page').then((m) => ({ Component: m.Punto3Page })),
      },
      {
        path: 'talleres',
        lazy: () =>
          Promise.all([import('@/features/talleres/TalleresPage/TalleresPage'), import('@/domain/talleres/catalog')]).then(([m, c]) => ({
            Component: () => <m.TalleresPage talleres={c.TALLERES} />,
          })),
      },
      {
        // Cada taller con su propio PostgreSQL (PGlite) guardado en el navegador.
        path: 'talleres/:tallerId',
        lazy: () => import('@/features/talleres/TallerPage/TallerPage').then((m) => ({ Component: () => <m.TallerPage /> })),
      },
      {
        path: 'estado',
        lazy: () => import('@/features/estado/StatusPage/StatusPage').then((m) => ({ Component: () => <m.StatusPage /> })),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  ...(import.meta.env.DEV ? [{ path: '/ui', element: <UiShowcase /> }] : []),
]

export const router = createBrowserRouter(routes)
