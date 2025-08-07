import Link from "next/link";

export default function Sitemap() {
    return (
        <div className="min-h-screen bg-ambient px-6 pt-[10vh] py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-forest-medium mb-8">Site Map</h1>
                <div className="space-y-6 text-lg text-gray-800">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Core Pages</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/search">Search</Link></li>
                            <li><Link href="/upload">Upload Listing</Link></li>
                            <li><Link href="/chat">Chat</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">User</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li><Link href="/register">Register</Link></li>
                            <li><Link href="/auth/login">Login</Link></li>
                            <li><Link href="/profile">Profile</Link></li>
                            <li><Link href="/settings">Settings</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Legal & Info</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li><Link href="/settings/privacy-policy">Privacy Policy</Link></li>
                            {/* Add a /terms route if you have terms of use */}
                            <li><Link href="/sitemap">Sitemap</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
