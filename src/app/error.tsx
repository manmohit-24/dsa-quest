"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-lg font-medium">Something went wrong</h1>
      <p className="mb-4 text-[13px] text-muted">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
