import { useState, useEffect } from 'react';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setMessage(data.status))
      .catch(() => setMessage('Backend unavailable'));
  }, []);

  return (
    <div>
      <h1>Frontend + Backend Monorepo</h1>
      <p>Backend status: {message}</p>
    </div>
  );
}
