import { Icon } from "@iconify/react"

export default function Footer() {
    return (
        <footer className="bg-forest-medium text-white py-12 px-6 mt-16 w-full overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="flex items-center justify-between mb-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img className="w-8 h-8" src="./logo.png" alt="Casaway Logo"/>
                            <h3 className="text-xl font-bold">Casaway</h3>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                            Connect with travelers worldwide for safe and authentic home swaps. 
                            Experience the world like a local.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                                <Icon icon="mdi:facebook" className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                                <Icon icon="mdi:twitter" className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                                <Icon icon="mdi:instagram" className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                                <Icon icon="mdi:linkedin" className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Explore</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/" className="text-sm text-white/80 hover:text-white transition-colors duration-200">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/search" className="text-sm text-white/80 hover:text-white transition-colors duration-200">
                                    Search
                                </a>
                            </li>
                            <li>
                                <a href="/upload" className="text-sm text-white/80 hover:text-white transition-colors duration-200">
                                    Post
                                </a>
                            </li>
                            <li>
                                <a href="/chat" className="text-sm text-white/80 hover:text-white transition-colors duration-200">
                                    Messages
                                </a>
                            </li>
                        </ul>
                    </div>

                 
                </div>

                {/* Newsletter Signup */}
                <div className="border-t border-white/20 pt-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Stay Connected</h4>
                            <p className="text-sm text-white/80">Get travel tips and exclusive swap opportunities</p>
                        </div>
                        <div className="flex w-full md:w-auto">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 flex-1 md:w-64"
                            />
                            <button className="px-6 py-2 bg-white text-forest-medium font-semibold rounded-r-lg hover:bg-white/90 transition-colors duration-200">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                            <p className="text-sm text-white/80">
                                © 2025 Casaway, Inc. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-white/80">
                                <a href="/terms" className="hover:text-white transition-colors duration-200">
                                    Terms
                                </a>
                                <span>•</span>
                                <a href="/privacy" className="hover:text-white transition-colors duration-200">
                                    Privacy
                                </a>
                                <span>•</span>
                                <a href="/sitemap" className="hover:text-white transition-colors duration-200">
                                    Sitemap
                                </a>
                            </div>
                        </div>
                        
                        
                    </div>
                </div>
            </div>
        </footer>
    );
}