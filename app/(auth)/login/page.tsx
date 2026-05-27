import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            PersonaPage
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Error message from failed login attempt */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-zinc-400 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-zinc-950 font-medium text-sm rounded-lg py-2.5 hover:bg-zinc-100 transition"
          >
            Sign in
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          No account?{' '}
          <a href="/signup" className="text-zinc-300 hover:text-white transition">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}