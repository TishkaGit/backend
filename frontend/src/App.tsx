import { useState } from 'react';
import { api } from './api';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const register = async () => {
    const res = await api.post('/auth/register', {
      email,
      password,
      role: 'buyer',
    });

    console.log(res.data);
  };

  const login = async () => {
    const res = await api.post('/auth/login', {
      email,
      password,
    });

    localStorage.setItem('token', res.data.access_token);
    setToken(res.data.access_token);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🔥 Lead Platform</h1>

      <input
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        placeholder="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>

      {token && <p>✅ Logged in</p>}
    </div>
  );
}

export default App;