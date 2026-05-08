import { useState } from 'react'
import { api } from './api.ts'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')

  async function register() {
    try {
      const res = await api.post('/auth/register', {
        email,
        password,
        role: 'buyer',
      })

      console.log(res.data)

      alert('REGISTER SUCCESS')
    } catch (e: any) {
      console.log(e.response?.data)

      alert('REGISTER ERROR')
    }
  }

  async function login() {
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      })

      console.log(res.data)

      setToken(res.data.access_token)

      localStorage.setItem(
        'token',
        res.data.access_token,
      )

      alert('LOGIN SUCCESS')
    } catch (e: any) {
      console.log(e.response?.data)

      alert('LOGIN ERROR')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🔥 Lead Platform</h1>

      <input
        placeholder="email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br />

      <input
        type="password"
        placeholder="password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />

      <button onClick={register}>
        Register
      </button>

      <button onClick={login}>
        Login
      </button>

      {token && <p>✅ Logged in</p>}
    </div>
  )
}

export default App