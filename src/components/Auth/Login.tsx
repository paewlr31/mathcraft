// src/components/Auth/Login.tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import AuthLayout from './AuthLayout'
import { Eye, EyeOff } from 'lucide-react'  // dodaj lucide-react jeśli jeszcze nie masz

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)  // ← NOWE
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Błędny email lub hasło')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <AuthLayout title="Logowanie">
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border  text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            placeholder="twoj@email.pl"
          />
        </div>

        {/* Pole hasła z przyciskiem oka */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Hasło</label>
          <div className="mt-1 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 pr-12 border  text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="••••••••"
            />
            {/* Przycisk oka */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-lg transition disabled:cursor-not-allowed"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </div>

        <div className="text-center">
          <Link to="/reset-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            Zapomniałeś hasła?
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}