import "./globals.css";
import Header from "./componets/header";
import Footer from "./componets/footer";

export const metadata = {
  title: "Aurie's Publishing Platform",
  description: "Medium-style blog built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#F3EDE4] text-[#1B4D3E]">
        <Header />
        <main className="max-w-5xl mx-auto p-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
