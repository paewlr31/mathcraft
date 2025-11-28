// src/components/Auth/Register.tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AuthLayout from './AuthLayout'
import { Eye, EyeOff } from 'lucide-react'

// Regex z plusem i innymi znakami specjalnymi
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+])[A-Za-z\d@$!%*?&+]{8,}$/

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    if (!email.trim()) {
      setMessage({ text: 'Podaj adres email', type: 'error' })
      setLoading(false)
      return
    }

    if (!passwordRegex.test(password)) {
      setMessage({
        text: 'Hasło musi mieć min. 8 znaków, dużą i małą literę, cyfrę oraz jeden z tych znaków: @ $ ! % * ? & +',
        type: 'error',
      })
      setLoading(false)
      return
    }

    if (password !== password2) {
      setMessage({ text: 'Hasła się nie zgadzają', type: 'error' })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('already')) {
          setMessage({ text: 'Konto z tym adresem email już istnieje', type: 'error' })
        } else {
          setMessage({ text: error.message || 'Coś poszło nie tak', type: 'error' })
        }
        return
      }

      // 🔹 Automatyczne dodanie do tabeli profiles
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          role: 'STUDENT', // domyślna rola
        })
      }

      setMessage({
        text: `Wysłaliśmy link potwierdzający na adres:\n${email}\n\nKliknij w link, a potem zaloguj się!`,
        type: 'success',
      })
      setEmail('')
      setPassword('')
      setPassword2('')
    } catch {
      setMessage({ text: 'Błąd połączenia z serwerem', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Rejestracja">
      <form onSubmit={handleRegister} className="space-y-6">

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            placeholder="twoj@email.pl"
          />
        </div>

        {/* Hasło */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Hasło</label>
          <div className="mt-1 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 pr-12 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              placeholder="Min. 8 znaków, duża/mała, cyfra, znak specjalny"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Min. 8 znaków • duża i mała litera • cyfra • znak specjalny (@ $ ! % * ? & +)
          </p>
        </div>

        {/* Powtórz hasło */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Powtórz hasło</label>
          <div className="mt-1 relative">
            <input
              type={showPassword2 ? 'text' : 'password'}
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="block w-full px-4 py-3 pr-12 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
            >
              {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Komunikaty */}
        {message && (
          <div
            className={`p-4 rounded-lg text-center font-medium ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
            style={{ whiteSpace: 'pre-line' }}
          >
            {message.text}
          </div>
        )}

        {/* Przycisk */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-lg transition"
        >
          {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
        </button>
      </form>
    </AuthLayout>
  )
}
