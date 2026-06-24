import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const passwordRules = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (value: string) => value.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: 'One special character',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
]

export default function Register() {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const passwordValidation = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, valid: rule.test(password) })),
    [password],
  )

  const isPasswordValid = passwordValidation.every((rule) => rule.valid)

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError('')

      if (!isPasswordValid) {
        setError('Password must contain uppercase, lowercase, number, special character, and be at least 8 characters.')
        return
      }

      try {
        await register({ full_name: fullName, email, password })
        navigate('/login')
      } catch (err) {
        setError((err as Error).message || 'Registration failed. Please try again.')
      }
    },
    [email, fullName, isPasswordValid, navigate, password, register],
  )

  return (
    <main className="page auth-page">
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Full Name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <ul className="validation-list">
          {passwordValidation.map((rule) => (
            <li key={rule.id} className={rule.valid ? 'valid' : 'invalid'}>
              {rule.label}
            </li>
          ))}
        </ul>

        {error && <p className="error-text">{error}</p>}
        <button type="submit">Register</button>
      </form>
    </main>
  )
}
