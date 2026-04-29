export default function ContentWrapper({ children }) {
  return (
  <main className="relative z-0 flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </main>
  );
}