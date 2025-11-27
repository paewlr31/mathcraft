// src/components/Auth/UpdatePassword.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import AuthLayout from './AuthLayout'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>('Ładowanie...')
  const navigate = useNavigate()

  useEffect(() => {
    // KLUCZOWA RZECZ – pobieramy access_token z URL-a!
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const accessToken = params.get('access_token')
    const type = params.get('type')

    if (type === 'recovery' && accessToken) {
      // Ręcznie ustawiamy sesję!
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: params.get('refresh_token') || '',
      }).then(({ error }) => {
        if (error) {
          setMessage('Link wygasł lub jest nieprawidłowy')
        } else {
          setMessage('Wpisz nowe hasło poniżej')
        }
      })
    } else {
      setMessage('Nieprawidłowy link resetujący hasło')
    }

    // Czyścimy URL (żeby nie było brzydkiego #access_token=...)
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (password !== password2) {
      setMessage('Hasła się nie zgadzają')
      return
    }
    if (password.length < 8) {
      setMessage('Hasło musi mieć minimum 8 znaków')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage(error.message)
    } else {
      await supabase.auth.signOut()
      setMessage('Hasło zmienione! Przekierowujemy do logowania...')
      setTimeout(() => navigate('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <AuthLayout title="Zmień hasło">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Nowe hasło</h2>
            <p className="text-gray-600 mt-2">Wprowadź nowe hasło do swojego konta</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nowe hasło
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Minimum 8 znaków"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Powtórz nowe hasło
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Powtórz hasło"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-center font-medium ${
              message.includes('zmienione') || message.includes('Wpisz')
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || message?.includes('Link wygasł')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg shadow-lg transition"
          >
            {loading ? 'Zapisywanie...' : 'Zmień hasło'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}