import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
      <Logo size="lg" className="mb-6" />
      <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-950">
        Page Not Found
      </h1>
      <p className="mt-3 text-lg text-stone-600 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="/"
          className="px-6 py-3 bg-blueprint text-white rounded-lg font-medium hover:bg-blueprint-light transition-colors"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
