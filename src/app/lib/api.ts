cat > src/app/lib/api.ts <<'EOF'
// src/app/lib/api.ts

const BASE = process.env.NEXT_PUBLIC_API_BASE!; // usa tu variable de entorno

type Opts = RequestInit & { authToken?: string };

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const { authToken, headers, ...rest } = opts;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(\`API \${res.status} \${res.statusText} → \${text}\`);
  }
  return res.json() as Promise<T>;
}
EOF
