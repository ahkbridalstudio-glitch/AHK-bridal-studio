import { LoaderCircle } from 'lucide-react';

export function ApiLoadingBar({ className = '' }: { className?: string }) {
  return <div className={`flex w-full items-center justify-center ${className}`} role="status" aria-label="Loading content"><LoaderCircle className="h-10 w-10 animate-spin text-[#7A0C1E]"/><span className="sr-only">Loading content</span></div>;
}
