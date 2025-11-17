// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Aurie's Medium",
  description: "A clean publishing platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#F5F1E8] text-[#1A3D2F]">
        <header className="border-b border-[#D6CBBE] bg-[#F5F1E8] sticky top-0 z-50">
          <nav className="flex items-center justify-between px-10 py-4">
            <h1 className="text-2xl font-bold text-[#1A3D2F]">Aurie Medium</h1>

            <div className="flex gap-6 text-[#1A3D2F]">
              <a href="/" className="hover:underline">Home</a>
              <a href="/write" className="hover:underline">Write</a>
              <a href="/login" className="hover:underline">Login</a>
            </div>
          </nav>
        </header>

        <main className="px-10 py-10">{children}</main>

        <footer className="mt-20 bg-[#1A3D2F] text-[#F5F1E8] py-10 text-center">
          <p>Aurie Medium © {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
