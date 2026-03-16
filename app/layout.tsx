import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import SearchBar from "@/components/SearchBar";
import { Suspense } from "react"; // 1. Import Suspense

export const metadata: Metadata = {
  title: "TransportRoute App",
  description: "Manage transit routes efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-80 transition">
              TransportRoute
            </Link>
            
            <div className="flex items-center gap-4">
              {/* 2. Wrap SearchBar in Suspense with a visual fallback */}
              <Suspense fallback={
                <div className="w-48 md:w-64 h-10 bg-slate-100 animate-pulse rounded-md border border-slate-200"></div>
              }>
                <SearchBar />
              </Suspense>

              <Link 
                href="/create" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all text-sm"
              >
                + Create Route
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}