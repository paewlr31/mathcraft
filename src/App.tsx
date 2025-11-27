import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

//Komonenty
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './pages/Dashboard'
import UpdatePassword from './components/Auth/UpdatePassword'
import ResetPassword from './components/Auth/ResetPassword'

// Kursy
import MaturaRozszerzona from './pages/kursy/MaturaRozszerzona';
import MaturaPodstawowa from './pages/kursy/MaturaPodstawowa';
import IBMath from './pages/kursy/IBMath';
import Korepetycje from './pages/kursy/Korepetycje';

// Zespół
import Ty from './pages/zespol/Ty';
import Anna from './pages/zespol/Anna';
import Michal from './pages/zespol/Michal';
import Kasia from './pages/zespol/Kasia';

function App() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return (
    <Router>
      <ScrollToTop /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route
          path="/dashboard"
          element={session ? <Dashboard /> : <Navigate to="/login" />}
        />
        {/* Kursy */}
        <Route path="/kursy/matura-rozszerzona" element={<MaturaRozszerzona />} />
        <Route path="/kursy/matura-podstawowa" element={<MaturaPodstawowa />} />
        <Route path="/kursy/ib-math" element={<IBMath />} />
        <Route path="/kursy/korepetycje" element={<Korepetycje />} />

        {/* Zespół */}
        <Route path="/zespol/ty" element={<Ty />} />
        <Route path="/zespol/anna" element={<Anna />} />
        <Route path="/zespol/michal" element={<Michal />} />
        <Route path="/zespol/kasia" element={<Kasia />} />
        {/* inne strony później */}
      </Routes>
    </Router>
  )
}

export default App