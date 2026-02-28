import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import "./globals.css";

export const metadata = {
  title: "HackPlate — Student Event Intelligence",
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
          <div className="app-shell">
            {/* ── Sidebar ── */}
            <aside className="w-[220px] shrink-0 hidden md:flex flex-col justify-between border-r border-[#E5E7EB] bg-white">
              <div className="px-5 pt-6 pb-4">
                <div className="flex items-center gap-2.5 mb-8">
                  <div className="w-[22px] h-[22px] rounded-md bg-[#4F46E5]"></div>
                  <span className="text-[15px] font-semibold tracking-tight text-[#111827]">HackPlate</span>
                </div>

                <nav className="flex flex-col gap-0.5">
                  <a href="/" className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium bg-[#F3F4F6] text-[#111827]">
                    <svg className="w-[15px] h-[15px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Dashboard
                  </a>
                  <a href="/search" className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                    <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Search
                  </a>
                  <a href="/map" className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                    <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    Map
                  </a>
                  <a href="/favorites" className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                    <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    Saved
                  </a>
                  <a href="/settings" className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                    <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                  </a>
                </nav>
              </div>

              <div className="px-5 pb-5 border-t border-[#E5E7EB] pt-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn btn-secondary w-full text-[13px]">Sign in</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-2.5">
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-7 h-7 rounded-full" } }} />
                    <span className="text-[13px] text-[#6B7280]">Account</span>
                  </div>
                </SignedIn>
              </div>
            </aside>

            {/* ── Main ── */}
            <main className="main-scroll">
              <div className="page-wrap">
                {children}
              </div>
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
