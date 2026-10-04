import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage/HomePage'
import { NotFound } from '@/features/shared/NotFound/NotFound'
import { StatusPage } from '@/features/estado/StatusPage/StatusPage'
import { PointPlaceholder } from '@/features/shared/PointPlaceholder/PointPlaceholder'
import { UiShowcase } from '@/features/ui-showcase/UiShowcase'
import { AppShell } from '@/layout/AppShell/AppShell'
import { EXAM_POINTS } from '@/layout/navigation'

const [punto1, punto2, punto3] = EXAM_POINTS

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell points={EXAM_POINTS} />,
    children: [
      { index: true, element: <HomePage points={EXAM_POINTS} /> },
      // El punto 1 tendrá su propio layout y subrutas (fase 6).
      { path: 'punto-1/*', element: <PointPlaceholder point={punto1} phase={6} /> },
      { path: 'punto-2', element: <PointPlaceholder point={punto2} phase={5} /> },
      { path: 'punto-3', element: <PointPlaceholder point={punto3} phase={7} /> },
      { path: 'estado', element: <StatusPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  ...(import.meta.env.DEV ? [{ path: '/ui', element: <UiShowcase /> }] : []),
]

export const router = createBrowserRouter(routes)
