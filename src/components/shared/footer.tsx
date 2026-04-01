export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100/50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400">
        <p>
          Built by{" "}
          <a
            href="https://github.com/omniharmonic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 hover:text-stone-700 underline underline-offset-2"
          >
            omniharmonic
          </a>
        </p>
        <p>Constitution Builder</p>
      </div>
    </footer>
  );
}
