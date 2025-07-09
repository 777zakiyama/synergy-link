import { useState } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import VisionMapCreator from './VisionMapCreator'

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
    }
    return <LoginPage onSwitchToRegister={() => setShowRegister(true)} />
  }

  return <VisionMapCreator />
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}

export default App
