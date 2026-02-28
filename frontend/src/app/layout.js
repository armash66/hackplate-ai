import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "HackPlate",
  description: "Find hackathons with food near you.",
};

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Events" },
  { href: "/map", label: "Map" },
  { href: "/favorites", label: "Saved" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        </head>
        <body>
          {/* ── Top Bar ── */}
          <header style={{
            height: 52,
            borderBottom: '1px solid #EBEBEB',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <Link href="/" style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
                HackPlate
              </Link>
              <nav style={{ display: 'flex', gap: 4 }}>
                {links.map(l => (
                  <Link key={l.href} href={l.href} style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#737373',
                    padding: '6px 12px',
                    borderRadius: 6,
                    transition: 'color 150ms, background 150ms',
                  }}
                    onMouseEnter={e => { e.target.style.color = '#1A1A1A'; e.target.style.background = '#F5F5F4'; }}
                    onMouseLeave={e => { e.target.style.color = '#737373'; e.target.style.background = 'transparent'; }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SignedOut>
                <SignInButton mode="modal">
                  <button style={{
                    fontSize: 13, fontWeight: 500, color: '#FFF',
                    background: '#5B5BD6', border: 'none', borderRadius: 6,
                    padding: '6px 14px', cursor: 'pointer',
                  }}>Sign in</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
              </SignedIn>
            </div>
          </header>

          {/* ── Page ── */}
          <main style={{ maxWidth: 920, margin: '0 auto', padding: '40px 24px 80px' }}>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
