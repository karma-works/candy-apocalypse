import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { CssVarsProvider } from '@mui/joy'
import React from 'react'
import ReactDOM from 'react-dom/client'
import StartUp from './StartUp'

const router = createBrowserRouter([
  {
    path: '/',
    element: <StartUp />,
  },
  {
    path: 'play',
    async lazy() {
      const DoomFromRouter = await import('./DoomReact/DoomFromRouter');
      return { Component: DoomFromRouter.default };
    },
  },
], {
  basename: import.meta.env.BASE_URL,
})

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <CssVarsProvider defaultMode='dark'>
      <RouterProvider router={router} />
    </CssVarsProvider>
  </React.StrictMode>,
)
