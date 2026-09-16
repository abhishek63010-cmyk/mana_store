"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main role="alert">
      <h1>Something went wrong.</h1>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
