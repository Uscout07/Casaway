import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-forest-medium text-white py-12 px-6 mt-16 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-8">
          {/* Company Info */}
          <div className="space-y-4 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start items-center space-x-2">
              <img className="w-8 h-8" src="./logo.png" alt="Casaway Logo" />
              <h3 className="text-xl font-bold">Casaway</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Connect with travelers worldwide for safe and authentic home swaps. 
              Experience the world like a local.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              {["facebook", "twitter", "instagram", "linkedin"].map((platform) => (
                <a key={platform} href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                  <Icon icon={`mdi:${platform}`} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4 text-center lg:text-left">
            <h4 className="text-lg font-semibold">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Search", href: "/search" },
                { label: "Post", href: "/upload" },
                { label: "Messages", href: "/chat" },
              ].map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-sm text-white/80 hover:text-white transition-colors duration-200">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-semibold mb-2">Stay Connected</h4>
              <p className="text-sm text-white/80">Get travel tips and exclusive swap opportunities</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-lg sm:rounded-r-none sm:rounded-l-lg focus:outline-none focus:ring-2 focus:ring-white/30 flex-1 sm:w-64"
              />
              <button className="mt-2 sm:mt-0 sm:ml-0 px-6 py-2 bg-white text-forest-medium font-semibold rounded-lg sm:rounded-l-none hover:bg-white/90 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/80 text-center md:text-left">
              © 2025 Casaway, Inc. All rights reserved.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-white/80">
              <a href="/terms" className="hover:text-white transition-colors duration-200">Terms</a>
              <span>•</span>
              <a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy</a>
              <span>•</span>
              <a href="/sitemap" className="hover:text-white transition-colors duration-200">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
