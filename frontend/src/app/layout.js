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
                    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">HackPlate</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
              <a href="/search" className="text-gray-300 hover:text-white transition-colors">Search</a>
              <a href="/map" className="text-gray-300 hover:text-white transition-colors">Map View</a>
              <a href="/activity" className="text-gray-300 hover:text-white transition-colors">My Activity</a>
              <a href="/analytics" className="text-gray-300 hover:text-white transition-colors">Analytics</a>
            </div>
            <div className="flex items-center space-x-4">
               {/* Clerk Auth Integration */}
               <SignedOut>
                 <SignInButton mode="modal">
                   <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/30">
                     Sign In
                   </button>
                 </SignInButton>
               </SignedOut>
               <SignedIn>
                 <UserButton afterSignOutUrl="/" appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 border-2 border-gray-800 rounded-full shadow-lg"
                    }
                 }} />
               </SignedIn>
            </div>
          </div>
        </div>
      </nav>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
