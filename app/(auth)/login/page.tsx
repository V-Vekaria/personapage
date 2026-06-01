import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_34rem),linear-gradient(180deg,#09090b_0%,#181020_48%,#09090b_100%)] flex items-center justify-center px-4 py-10 text-white">
      <div className="absolute inset-x-4 top-16 h-72 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18),transparent_68%)] blur-3xl" aria-hidden />

      <div className="relative w-full max-w-sm rounded-lg border border-violet-300/15 bg-zinc-950/75 p-5 sm:p-6 shadow-[0_24px_80px_rgba(24,8,45,0.55),0_0_42px_rgba(124,58,237,0.14)] backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-violet-200/75 uppercase tracking-widest mb-3">
            PersonaPage
          </p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Sign in
          </h1>
          <p className="text-zinc-300 text-sm mt-2">Continue to your account</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-950/80 border border-red-800/80 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-zinc-900/80 border border-violet-300/10 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-300/35 focus:border-violet-300/35 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-zinc-900/80 border border-violet-300/10 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-300/35 focus:border-violet-300/35 transition"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-white to-violet-100 text-zinc-950 font-medium text-sm rounded-lg py-2.5 shadow-[0_0_30px_rgba(124,58,237,0.22)] hover:from-white hover:to-fuchsia-100 transition"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm mt-6">
          No account?{' '}
          <a href="/signup" className="text-violet-100 hover:text-white transition">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
