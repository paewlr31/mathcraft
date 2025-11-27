import { Link } from 'react-router-dom'

export default function AuthLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-bold text-blue-700">MATHCRAFT.PL</h2>
        <h3 className="mt-8 text-center text-2xl font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>

        <div className="mt-6 text-center">
          <Link to={title.includes('Logowanie') ? '/register' : '/login'} className="text-blue-600 hover:text-blue-500">
            {title.includes('Logowanie') ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
          </Link>
        </div>
      </div>
    </div>
  )
}