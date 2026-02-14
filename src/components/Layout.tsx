import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout Component
 *
 * Navigation wrapper for the app
 * - Simple header with app name
 * - Navigation tabs for different views
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Energy Patterns
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
