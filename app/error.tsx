'use client';

import React from 'react';
import ErrorPage from './components/ErrorPage';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      title="Something went wrong!"
      message={error.message || "An unexpected error occurred. Please try again."}
      errorCode={error.digest || "Error"}
      icon="material-symbols:error"
      className="min-h-screen"
    />
  );
}
