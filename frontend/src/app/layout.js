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
                <body className="flex h-screen overflow-hidden bg-[#0B0F1A] text-[#F3F4F6]">
                    {/* LEFT SIDEBAR: Minimal & Restrained */}
                    <aside className="w-64 bg-[#0B0F1A] border-r border-[#1F2937] flex flex-col justify-between hidden md:flex shrink-0 relative z-20">
                        <div className="p-6">
                            <h1 className="text-xl font-bold mb-8 text-[#F3F4F6] tracking-tight">
                                HackPlate
                            </h1>
                            <nav className="flex flex-col space-y-1 font-medium">
                                <a href="/" className="px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-[#111827] text-[#F3F4F6] flex items-center gap-3 border-l-2 border-[#6366F1] bg-[#111827]/50">
                                    <svg className="w-4 h-4 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                    Dashboard
                                </a>
                                <a href="/search" className="px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-[#111827] text-[#9CA3AF] flex items-center gap-3 border-l-2 border-transparent">
                                    <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                    Opportunity Radar
                                </a>
                                <a href="/map" className="px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-[#111827] text-[#9CA3AF] flex items-center gap-3 border-l-2 border-transparent">
                                    <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                                    Map View
                                </a>
                                <a href="/activity" className="px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-[#111827] text-[#9CA3AF] flex items-center gap-3 border-l-2 border-transparent">
                                    <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                                    Alerts
                                </a>
                            </nav>
                        </div>

                        {/* User Identity / Settings area at the bottom */}
                        <div className="p-6 border-t border-[#1F2937]">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full py-2 px-4 text-sm font-medium rounded-lg text-white bg-[#111827] border border-[#1F2937] hover:bg-[#1F2937] transition-colors">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#111827] border border-[#1F2937]">
                                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full" }}} />
                                    <span className="text-sm font-medium text-[#9CA3AF]">My Profile</span>
                                </div>
                            </SignedIn>
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <main className="flex-1 overflow-y-auto relative h-full">
                        {children}
                    </main>
                </body>
            </html>
        </ClerkProvider>
    );
}
