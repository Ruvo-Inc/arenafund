import Link from 'next/link';
import Image from 'next/image';
import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-arena-navy text-white py-16">
      <div className="arena-container px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="Arena Fund"
                width={36}
                height={36}
                className="w-9 h-9"
              />
              <span className="text-lg font-semibold text-white">Arena Fund</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The only VC fund that validates Fortune 500 buyers before investing.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-arena-gold">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/team" className="hover:text-white transition-colors">Team</Link></li>
              <li><Link href="/thesis" className="hover:text-white transition-colors">Thesis</Link></li>
              <li><Link href="/insights" className="hover:text-white transition-colors">Insights</Link></li>
              <li><Link href="/process" className="hover:text-white transition-colors">Process</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-arena-gold">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/apply" className="hover:text-white transition-colors">Apply</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-arena-gold">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@thearenafund.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Arena Fund. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
