// src/components/Auth/Register.tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AuthLayout from './AuthLayout'

// Działa z: Saco+3gic, Test123!, Abc@1234, itp.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+])[A-Za-z\d@$!%*?&+]{8,}$/

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    // 1. Czy email jest podany?
    if (!email.trim()) {
      setMessage({ text: 'Podaj adres email', type: 'error' })
      setLoading(false)
      return
    }

    // 2. Walidacja hasła
    if (!passwordRegex.test(password)) {
      setMessage({
        text: 'Hasło musi mieć min. 8 znaków, dużą i małą literę, cyfrę oraz znak specjalny (@$!%*?&)',
        type: 'error',
      })
      setLoading(false)
      return
    }

    // 3. Czy hasła się zgadzają?
    if (password !== password2) {
      setMessage({ text: 'Hasła się nie zgadzają', type: 'error' })
      setLoading(false)
      return
    }

    // 4. Rejestracja w Supabase
    supabase.auth
      .signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      .then(({ data, error }) => {
        if (error) {
          // Najczęstsze błędy Supabase po polsku
          if (error.message.includes('User already registered') || error.message.includes('already')) {
            setMessage({ text: 'Konto z tym adresem email już istnieje', type: 'error' })
          } else if (error.message.includes('Password should be at least')) {
            setMessage({ text: 'Hasło jest za krótkie (min. 8 znaków)', type: 'error' })
          } else {
            setMessage({ text: error.message || 'Coś poszło nie tak', type: 'error' })
          }
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
          // User już istnieje (Supabase czasem tak zwraca)
          setMessage({ text: 'Konto z tym adresem email już istnieje', type: 'error' })
        } else {
          // Sukces!
          setMessage({
            text: `Wysłaliśmy link potwierdzający na adres:\n${email}\n\nKliknij w link, a potem zaloguj się!`,
            type: 'success',
          })
          // Czyścimy pola po sukcesie (opcjonalnie)
          setEmail('')
          setPassword('')
          setPassword2('')
        }
      })
      .catch(() => {
        setMessage({ text: 'Błąd połączenia z serwerem', type: 'error' })
      })
      .finally(() => {
        setLoading(false)
      })
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
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="twoj@email.pl"
          />
        </div>

        {/* Hasło */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Hasło</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Min. 8 znaków, duża/mała litera, cyfra, znak specjalny"
          />
        </div>

        {/* Powtórz hasło */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Powtórz hasło</label>
          <input
            type="password"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Komunikaty */}
        {message && (
          <div
            className={`p-4 rounded-lg text-center font-medium ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
            style={{ whiteSpace: 'pre-line' }} // żeby \n działało
          >
            {message.text}
          </div>
        )}

        {/* Przycisk */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow transition disabled:cursor-not-allowed"
        >
          {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
        </button>
      </form>
    </AuthLayout>
  )
}