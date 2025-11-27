// src/components/Auth/ResetPassword.tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AuthLayout from './AuthLayout'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    if (!email.trim()) {
      setMessage({ text: 'Podaj adres email', type: 'error' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      // Po zmianie hasła wraca na stronę logowania (nie loguje automatycznie!)
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      setMessage({ text: error.message || 'Coś poszło nie tak', type: 'error' })
    } else {
      setMessage({
        text: `Gotowe! Wysłaliśmy link do zmiany hasła na:\n${email}\n\nKliknij w link, zmień hasło, a potem zaloguj się ponownie.`,
        type: 'success',
      })
      setEmail('')
    }

    setLoading(false)
  }

  return (
    <AuthLayout title="Resetowanie hasła">
      <form onSubmit={handleReset} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Podaj email swojego konta
          </label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border  text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="twoj@email.pl"
          />
        </div>

        {message && (
          <div
            className={`p-5 rounded-lg text-center font-medium border ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}
            style={{ whiteSpace: 'pre-line' }}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-lg transition disabled:cursor-not-allowed"
        >
          {loading ? 'Wysyłanie linku...' : 'Wyślij link do zmiany hasła'}
        </button>

        <div className="text-center mt-6">
          <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            ← Wróć do logowania
          </a>
        </div>
      </form>
    </AuthLayout>
  )
}