import { signup } from './actions'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function SignupPage({ searchParams }: Props) {
  // Next.js 15 requires awaiting searchParams
  const params = await searchParams

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Create account
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Start building your PersonaPage</p>
        </div>

        <form action={signup} className="space-y-4">

          {/* ── Username ── */}
          <div>
            <label htmlFor="username" className="block text-sm text-zinc-400 mb-1.5">
              Username
            </label>
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-zinc-600 focus-within:border-zinc-600 transition">
              <span className="text-zinc-500 text-sm mr-1">persona.page/</span>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-600 focus:outline-none"
                placeholder="yourname"
              />
            </div>
            <p className="text-zinc-600 text-xs mt-1">This is your public URL — choose carefully</p>
          </div>

          {/* ── Email ── */}
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

          {/* ── Password ── */}
          <div>
            <label htmlFor="password" className="block text-sm text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition"
              placeholder="Min 8 characters"
            />
          </div>

          {/* ── Error message ── */}
          {params.error && (
            <div className="px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
              {params.error}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            className="w-full bg-white text-zinc-950 font-medium text-sm rounded-lg py-2.5 hover:bg-zinc-100 transition"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Have an account?{' '}
          <a href="/login" className="text-zinc-300 hover:text-white transition">
            Sign in
          </a>
        </p>

      </div>
    </div>
  )
}