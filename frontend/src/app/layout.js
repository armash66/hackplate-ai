import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import "./globals.css";

export const metadata = {
    title: "HackPlate -- Student Event Intelligence",
    description: "Find hackathons with food. Location-aware. Score-ranked. Real-time alerts.",
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
                    <nav className="nav">
                        <a href="/" className="nav-brand">HackPlate</a>
                        <div className="nav-links">
                            <a href="/">Dashboard</a>
                            <a href="/search">Search</a>
                            <a href="/map">Map</a>
                            <a href="/analytics">Analytics</a>
                            <a href="/notifications">Alerts</a>
                            <SignedOut>
                                <SignInButton mode="modal" className="btn btn-primary" style={{ padding: "6px 16px", background: "var(--accent)" }} />
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </nav>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
