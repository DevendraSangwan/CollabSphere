export default function AuthPage({ mode, setMode, authForm, setAuthForm, handleAuth, loading }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Welcome</p>
        <h1>{mode === 'login' ? 'Sign in to CollabSphere' : 'Create your workspace'}</h1>

        <div className="toggle-group">
          <button type="button" className={mode === 'register' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setMode('register')}>
            Register
          </button>
          <button type="button" className={mode === 'login' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setMode('login')}>
            Login
          </button>
        </div>

        <form className="stack-form" onSubmit={handleAuth}>
          {mode === 'register' && (
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={authForm.name}
                onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                placeholder="Your full name"
                required
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={authForm.email}
              onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
              placeholder="••••••••"
              required
            />
          </label>

          <button className="primary-btn full" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
