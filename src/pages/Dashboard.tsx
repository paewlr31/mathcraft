import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/login')

      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(data?.role || 'student')
    }

    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Witaj w Mathcraft!</h1>
          {user && <p className="text-lg">Zalogowano jako: <strong>{user.email}</strong></p>}
          <p className="text-lg mt-2">Twoja rola: <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {role.toUpperCase()}
          </span>
          </p>

          {role === 'admin' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 font-medium">Jesteś administratorem!</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-8 px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  )
}