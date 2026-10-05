import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage/HomePage'
import { NotFound } from '@/features/shared/NotFound/NotFound'
import { PointPlaceholder } from '@/features/shared/PointPlaceholder/PointPlaceholder'
import { UiShowcase } from '@/features/ui-showcase/UiShowcase'
import { AppShell } from '@/layout/AppShell/AppShell'
import { EXAM_POINTS } from '@/layout/navigation'

const [punto1, , punto3] = EXAM_POINTS

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell points={EXAM_POINTS} />,
    children: [
      { index: true, element: <HomePage points={EXAM_POINTS} /> },
      // El punto 1 tendrá su propio layout y subrutas (fase 6).
      { path: 'punto-1/*', element: <PointPlaceholder point={punto1} phase={6} /> },
      {
        path: 'punto-2',
        // Carga diferida: supabase-js y la página del punto 2 solo se descargan al entrar.
        lazy: () => import('@/features/punto2/Punto2Page/Punto2Page').then((m) => ({ Component: m.Punto2Page })),
      },
      { path: 'punto-3', element: <PointPlaceholder point={punto3} phase={7} /> },
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
