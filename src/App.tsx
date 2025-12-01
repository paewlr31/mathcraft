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

// Shared pages
import Chat from './pages/sharedPages/chat'
import Umowy from './pages/sharedPages/umowy'
import Przewodnik from './pages/sharedPages/przewodnik'
import BazaWiedzyHome from './pages/sharedPages/baza-wiedzy/index'
import LevelPage from './pages/sharedPages/baza-wiedzy/Level'
import SectionPage from './pages/sharedPages/baza-wiedzy/Section'
import TopicPage from './pages/sharedPages/baza-wiedzy/Topic'
import ForumHome from './pages/sharedPages/forum/index'
import Category from './pages/sharedPages/forum/Category'
import Thread from './pages/sharedPages/forum/Thread'
import NewThread from './pages/sharedPages/forum/NewThread'
import TopicThreads from './pages/sharedPages/forum/TopicThreads'

//student pages
import Arkusze from './pages/student/arkusze' 
import KursyStudent from './pages/student/kursy'
import Zadania from './pages/student/zadania'
import Lekcje from './pages/student/lekcje'
import Najwazniejsze from './pages/student/najwazniejsze'


//teacher pages
import Uczniowie from './pages/teacher/uczniowie'
import Kalendarz from './pages/teacher/kalendarz'
import Ocenianie from './pages/teacher/ocenianie'
import Repo from './pages/teacher/repo'
import StatystykiUczniow from './pages/teacher/statystyki-uczniow'
import ArkuszeTeacher from './pages/teacher/arkusze'
import NajwazniejszeTeacher from './pages/teacher/najwazniejsze'
import KursyTeacher from './pages/teacher/kursy'

//admin pages
import ForumAdmin from './pages/admin/forum'
import KursyAdmin from './pages/admin/kursy'
import LekcjeAdmin from './pages/admin/lekcje'
import Finanse from './pages/admin/finanse'
import StatystykiGlobalne from './pages/admin/statystyki-globalne'
import Materialy from './pages/admin/materialy'
import System from './pages/admin/system'
import Users from './pages/admin/users'


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
       
        {/* Shared pages */}
      <Route path="/sharedPages/chat" element={session ? <Chat /> : <Navigate to="/login" />} />
      <Route path="/sharedPages/umowy" element={session ? <Umowy /> : <Navigate to="/login" />} />
      <Route path="/sharedPages/przewodnik" element={session ? <Przewodnik /> : <Navigate to="/login" />} />
      
      <Route path="/sharedPages/baza-wiedzy" element={<BazaWiedzyHome />} />
      <Route path="/sharedPages/baza-wiedzy/:levelSlug" element={<LevelPage />} />
      <Route path="/sharedPages/baza-wiedzy/:levelSlug/:sectionSlug" element={<SectionPage />} />
      <Route path="/sharedPages/baza-wiedzy/:levelSlug/:sectionSlug/:topicSlug" element={<TopicPage />} />
      <Route path="/forum" element={<ForumHome />} />
      <Route path="/forum/:category" element={<Category />} />
      
      <Route path="/forum/new" element={session ? <NewThread /> : <Navigate to="/login" />} />
      <Route path="/forum/topic/:topicId" element={<TopicThreads />} />
      <Route path="/forum/thread/:threadId" element={<Thread />} />

        {/* student pages */}
      <Route path="/student/arkusze" element={session ? <Arkusze /> : <Navigate to="/login" />} />
      <Route path="/student/kursy" element={session ? <KursyStudent /> : <Navigate to="/login" />} />
      <Route path="/student/zadania" element={session ? <Zadania /> : <Navigate to="/login" />} />
      <Route path="/student/lekcje" element={session ? <Lekcje /> : <Navigate to="/login" />} />
      <Route path="/student/najwazniejsze" element={session ? <Najwazniejsze /> : <Navigate to="/login" />} />
      
        {/* teacher pages */}
      <Route path="/teacher/uczniowie" element={session ? <Uczniowie /> : <Navigate to="/login" />} />
      <Route path="/teacher/kalendarz" element={session ? <Kalendarz /> : <Navigate to="/login" />} />
      <Route path="/teacher/ocenianie" element={session ? <Ocenianie /> : <Navigate to="/login" />} />
      <Route path="/teacher/repo" element={session ? <Repo /> : <Navigate to="/login" />} />
      <Route path="/teacher/statystyki-uczniow" element={session ? <StatystykiUczniow /> : <Navigate to="/login" />} />
      <Route path="/teacher/arkusze" element={session ? <ArkuszeTeacher /> : <Navigate to="/login" />} />
      <Route path="/teacher/najwazniejsze" element={session ? <NajwazniejszeTeacher /> : <Navigate to="/login" />} />
      <Route path="/teacher/kursy" element={session ? <KursyTeacher /> : <Navigate to="/login" />} />
        {/* admin pages */}
      <Route path="/admin/forum" element={session ? <ForumAdmin /> : <Navigate to="/login" />} />
      <Route path="/admin/kursy" element={session ? <KursyAdmin /> : <Navigate to="/login" />} />
      <Route path="/admin/lekcje" element={session ? <LekcjeAdmin /> : <Navigate to="/login" />} />
      <Route path="/admin/finanse" element={session ? <Finanse /> : <Navigate to="/login" />} />
      <Route path="/admin/statystyki-globalne" element={session ? <StatystykiGlobalne /> : <Navigate to="/login" />} />
      <Route path="/admin/materialy" element={session ? <Materialy /> : <Navigate to="/login" />} />
      <Route path="/admin/system" element={session ? <System /> : <Navigate to="/login" />} />
      <Route path="/admin/users" element={session ? <Users /> : <Navigate to="/login" />} />
        {/* inne strony później */}
      </Routes>
    </Router>
  )
}

export default App