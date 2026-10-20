import type { Metadata } from 'next';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import './globals.css';
import { InsforgeProvider } from './providers';
import { ThemeProvider } from '@/context/ThemeContext';
import { I18nProvider } from '@/context/I18nContext';

export const metadata: Metadata = {
  title: 'SouQ AI',
};

// Inline script to prevent FOUC (Flash of Unstyled Content / wrong theme)
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('souqai-theme');
    var theme = saved || 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.colorScheme = resolved;
  } catch(e) {}
})();
`;

const langScript = `
(function() {
  try {
    var saved = localStorage.getItem('souqai-lang');
    var lang = saved || 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cairo:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="antialiased font-arabic transition-colors duration-300 bg-[var(--bg-page)] text-[var(--text-primary)]" suppressHydrationWarning>
        <I18nProvider>
          <ThemeProvider>
            <InsforgeProvider>
              {children}
            </InsforgeProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
