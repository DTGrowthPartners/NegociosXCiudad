import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Radar, BarChart3, Zap } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lead Radar - Encuentra negocios sin presencia web',
  description:
    'MVP para detectar negocios que no tienen página web y generar oportunidades de outreach',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Navigation */}
          <nav className="glass-strong border-b border-gray-200/60 sticky top-0 z-40 shadow-navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-xl shadow-glow-blue group-hover:shadow-glow-blue-lg transition-shadow duration-300">
                      <Radar className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse-soft" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-dark-700 leading-tight tracking-tight">
                      Lead Radar
                    </span>
                    <span className="text-[10px] font-medium text-dark-300 uppercase tracking-widest leading-tight">
                      by Dt Growth Partners
                    </span>
                  </div>
                </Link>

                {/* Navigation links */}
                <div className="flex items-center gap-1">
                  <Link
                    href="/"
                    className="nav-link text-dark-500 hover:text-dark-700 px-4 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/scrape-runs"
                    className="nav-link text-dark-500 hover:text-dark-700 px-4 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Historial
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200/60 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-dark-300">
                  <Radar className="w-4 h-4" />
                  <span>Lead Radar</span>
                  <span className="text-gray-300">|</span>
                  <span>Detecta oportunidades de negocio</span>
                </div>
                <p className="text-xs text-dark-300">
                  Powered by Dt Growth Partners
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
