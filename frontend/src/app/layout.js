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
                <body className="flex h-screen overflow-hidden bg-[#0a0a0f] text-[#e8e8f0]">
                    {/* LEFT SIDEBAR: Zone 1 */}
                    <aside className="w-64 bg-[#12121a] border-r border-[#1e1e30] flex flex-col justify-between hidden md:flex shrink-0 relative z-20">
                        <div className="p-6">
                            <h1 className="text-2xl font-black mb-8 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                                HackPlate
                            </h1>
                            <nav className="flex flex-col space-y-2 font-medium">
                                <a href="/" className="px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#1a1a2e] hover:text-white text-gray-400 flex items-center gap-3">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                    Dashboard
                                </a>
                                <a href="/search" className="px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#1a1a2e] hover:text-white text-gray-400 flex items-center gap-3">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                    Search Hub
                                </a>
                                <a href="/map" className="px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#1a1a2e] hover:text-white text-gray-400 flex items-center gap-3">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                                    Radar Map
                                </a>
                                <a href="/activity" className="px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#1a1a2e] hover:text-white text-gray-400 flex items-center gap-3">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                                    Activity & Alerts
                                </a>
                                <a href="/analytics" className="px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#1a1a2e] hover:text-white text-gray-400 flex items-center gap-3">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                                    Intelligence
                                </a>
                            </nav>
                        </div>

                        {/* User Identity / Settings area at the bottom */}
                        <div className="p-6 border-t border-[#1e1e30]">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="flex items-center gap-3 p-2 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e]">
                                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9 border border-indigo-500/30 rounded-full" }}} />
                                    <span className="text-sm font-medium text-gray-300">My Profile</span>
                                </div>
                            </SignedIn>
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA: Zones 2 & 3 flow in here */}
                    <main className="flex-1 overflow-y-auto relative h-full">
                        {children}
                    </main>
                </body>
            </html>
        </ClerkProvider>
    );
}
