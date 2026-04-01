import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Make sure this path matches where you saved it!
import CsrfInitializer from "@/components/CsrfInitializer"; // Import the CSRF initializer
import { ToastProvider } from "@/components/ToastClient";

export const metadata: Metadata = {
  title: "TransportRoute | Dashboard",
  description: "Manage transit routes and vehicle fleets efficiently.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col selection:bg-purple-100 selection:text-purple-900`}>
        <ToastProvider> { children } </ToastProvider>
        <Navbar />
        <CsrfInitializer />

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 font-medium">
              &copy; 2026 TransportRoute Management System.
            </p>
            <div className="flex gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                System Operational
              </span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}