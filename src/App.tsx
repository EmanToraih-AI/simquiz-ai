import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import Home from './pages/Home'
import Demo from './pages/Demo'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
