import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

// Komponenty
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
import Chat from './pages/sharedPages/chat/index'
import Przewodnik from './pages/sharedPages/przewodnik'
import BlogHome from './pages/sharedPages/blog/index'
import AddPost from './pages/sharedPages/blog/add/index'
import BlogPost from './pages/sharedPages/blog/[slug]'
import BazaWiedzyHome from './pages/sharedPages/baza-wiedzy/index'
import LevelPage from './pages/sharedPages/baza-wiedzy/Level'
import SectionPage from './pages/sharedPages/baza-wiedzy/Section'
import TopicPage from './pages/sharedPages/baza-wiedzy/Topic'
import ForumHome from './pages/sharedPages/forum/index'
import Category from './pages/sharedPages/forum/Category'
import Thread from './pages/sharedPages/forum/Thread'
import NewThread from './pages/sharedPages/forum/NewThread'
import TopicThreads from './pages/sharedPages/forum/TopicThreads'

// Student pages
import KursyStudent from './pages/student/kursy'
import Zadania from './pages/student/zadania'
import Lekcje from './pages/student/lekcje'
import CourseDetailStudent from './pages/student/kursy/[id]'

// Teacher pages
import Kalendarz from './pages/teacher/kalendarz'
import Ocenianie from './pages/teacher/ocenianie'
import StatystykiUczniow from './pages/teacher/statystyki-uczniow'
import KursyTeacher from './pages/teacher/kursy'
import CourseDetail from './pages/teacher/kursy/[id]' 
import StudentHomework from './pages/teacher/ocenianie/uczen/[id]'

// Admin pages

import KursyAdmin from './pages/admin/kursy'
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
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />

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

        {/* Chat – tylko jedna ścieżka */}
        <Route path="/chat" element={session ? <Chat /> : <Navigate to="/login" />} />

        {/* Shared pages */}
        <Route path="/sharedPages/przewodnik" element={session ? <Przewodnik /> : <Navigate to="/login" />} />

        {/* Blog */}
        <Route path="/blog" element={<BlogHome />} />
        <Route path="/blog/add" element={<AddPost />} />  
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Baza wiedzy */}
        <Route path="/sharedPages/baza-wiedzy" element={<BazaWiedzyHome />} />
        <Route path="/sharedPages/baza-wiedzy/:levelSlug" element={<LevelPage />} />
        <Route path="/sharedPages/baza-wiedzy/:levelSlug/:sectionSlug" element={<SectionPage />} />
        <Route path="/sharedPages/baza-wiedzy/:levelSlug/:sectionSlug/:topicSlug" element={<TopicPage />} />

        {/* Forum */}
        <Route path="/forum" element={<ForumHome />} />
        <Route path="/forum/:category" element={<Category />} />
        <Route path="/forum/new" element={session ? <NewThread /> : <Navigate to="/login" />} />
        <Route path="/forum/topic/:topicId" element={<TopicThreads />} />
        <Route path="/forum/thread/:threadId" element={<Thread />} />

        {/* Student pages */}
        <Route path="/student/kursy" element={session ? <KursyStudent /> : <Navigate to="/login" />} />
        <Route path="/student/zadania" element={session ? <Zadania /> : <Navigate to="/login" />} />
        <Route path="/student/lekcje" element={session ? <Lekcje /> : <Navigate to="/login" />} />
        <Route path="/student/kursy/:id" element={session ? <CourseDetailStudent /> : <Navigate to="/login" />} />

        {/* Teacher pages */}
        <Route path="/teacher/kalendarz" element={session ? <Kalendarz /> : <Navigate to="/login" />} />
        <Route path="/teacher/ocenianie" element={session ? <Ocenianie /> : <Navigate to="/login" />} />
        <Route path="/teacher/statystyki-uczniow" element={session ? <StatystykiUczniow /> : <Navigate to="/login" />} />
        <Route path="/teacher/kursy" element={session ? <KursyTeacher /> : <Navigate to="/login" />} />
        <Route path="/teacher/kursy/:id" element={session ? <CourseDetail /> : <Navigate to="/login" />} />  
        <Route path="/teacher/ocenianie/uczen/:id" element={session ? <StudentHomework /> : <Navigate to="/login" />} />  

        {/* Admin pages */}
       
        <Route path="/admin/kursy" element={session ? <KursyAdmin /> : <Navigate to="/login" />} />
        <Route path="/admin/users" element={session ? <Users /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
