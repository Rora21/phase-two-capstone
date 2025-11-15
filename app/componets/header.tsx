export default function Header() {
  return (
    <header className="w-full py-4 px-6 bg-green-700 text-white">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">Aurie Blog</h1>
        <nav className="space-x-6">
          {/* <a href="/" className="hover:underline">Home</a> */}
          <a href="/write" className="hover:underline">Write</a>
          <a href="/login" className="hover:underline">Login</a>
          <a href="/signup" className="hover:underline">signup</a>
        </nav>
      </div>
    </header>
  );
}
