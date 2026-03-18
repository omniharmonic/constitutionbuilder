import { LogoWithText } from "./logo";

interface NavProps {
  children?: React.ReactNode;
}

export function Nav({ children }: NavProps) {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/">
          <LogoWithText size="sm" />
        </a>
        {children && (
          <nav className="flex items-center gap-4">
            {children}
          </nav>
        )}
      </div>
    </header>
  );
}
