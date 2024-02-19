import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { CssVarsProvider } from '@mui/joy'
import DoomFromRouter from './views/DoomFromRouter'
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
    element: <DoomFromRouter />,
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
