import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()

  return (
    <main className="page profile-page">
      <h1>Profile</h1>
      {user ? (
        <section className="profile-details">
          <p><strong>Name:</strong> {user.full_name || user.email}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button type="button" onClick={logout}>Sign Out</button>
        </section>
      ) : (
        <p>No user information available.</p>
      )}
    </main>
  )
}
