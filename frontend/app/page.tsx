
'use client';

import { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export default function Home() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`
        );

        if (!response.ok) {
          throw new Error('Backend request failed');
        }

        const result: HealthResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Connection failed'
        );
      } finally {
        setLoading(false);
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">PAW LMS</h1>

      <p>Frontend: Next.js</p>

      <div className="rounded-lg border p-6 w-full max-w-md">
        <h2 className="font-semibold mb-3">
          Backend Connection
        </h2>

        {loading && <p>Connecting...</p>}

        {error && (
          <p className="text-red-500">
            Backend connection failed: {error}
          </p>
        )}

        {data && (
          <div className="text-green-600 space-y-2">
            <p>Status: {data.status}</p>
            <p>{data.message}</p>
            <p className="text-sm text-gray-500">
              {data.timestamp}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
