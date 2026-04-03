import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastContainer } from './components/feedback/ToastContainer'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
