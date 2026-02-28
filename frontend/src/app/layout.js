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
                                <a href="/favorites" className="px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-[#111827] text-[#9CA3AF] flex items-center gap-3 border-l-2 border-transparent">
                                    <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                    Favorites
                                </a>
                                <a href="/settings" className="px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-[#111827] text-[#9CA3AF] flex items-center gap-3 border-l-2 border-transparent">
                                    <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Settings
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
