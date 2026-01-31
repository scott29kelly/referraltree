'use client';

import { PageError } from '@/components/ui/error-boundary';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-white min-h-screen">
        <PageError error={error} reset={reset} />
      </body>
    </html>
  );
}
