import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import "./globals.css";
import { TopBar } from "./components";

export const metadata = {
  title: "HackPlate — Student Event Intelligence",
  description: "Find hackathons with food. Location-aware. Score-ranked.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        </head>
        <body>
          <div className="shell">
            {/* ── Fixed Sidebar ── */}
            <aside className="sidebar">
              <div className="px-5 pt-6">
                <div className="mb-8">
                  <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', color: '#111827' }}>
                    HackPlate
                  </span>
                </div>
                <nav className="flex flex-col gap-1">
                  <a href="/" className="nav-link active">Dashboard</a>
                  <a href="/search" className="nav-link">Events</a>
                  <a href="/map" className="nav-link">Map</a>
                  <a href="/favorites" className="nav-link">Saved</a>
                  <a href="/settings" className="nav-link">Settings</a>
                </nav>
              </div>
              <div className="px-5 pb-5 border-t border-[#E5E7EB] pt-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn btn-ghost w-full text-[13px]">Sign in</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-2.5">
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-7 h-7 rounded-full" } }} />
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>Account</span>
                  </div>
                </SignedIn>
              </div>
            </aside>

            {/* ── Main Area ── */}
            <div className="main-area">
              <TopBar />
              <div className="page-scroll">
                <div className="page-content">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
