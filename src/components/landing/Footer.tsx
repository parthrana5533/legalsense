import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer id="contact" className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo className="mb-5 [&_span]:text-white [&_span_span]:text-accent" />
            <p className="text-white/70 text-base leading-relaxed max-w-md mb-8">
              LegalSense empowers individuals to understand their legal rights through
              AI-powered guidance. Accessible, structured, and trustworthy.
            </p>
            <div className="space-y-3 text-base text-white/60">
              <div className="flex items-center gap-3">
                <Mail size={20} />
                <span>support@legalsense.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} />
                <span>+91 1800-LEGAL-01</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} />
                <span>Bharuch, India</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-lg mb-5">Platform</h4>
            <ul className="space-y-3 text-base text-white/60">
              <li><a href="#features" className="hover:text-accent transition-colors">Features</a></li>
              <li><a href="#about" className="hover:text-accent transition-colors">How It Works</a></li>
              <li><Link to="/signup" className="hover:text-accent transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-lg mb-5">Legal</h4>
            <ul className="space-y-3 text-base text-white/60">
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-10 text-center text-base text-white/40">
          <p>&copy; {new Date().getFullYear()} LegalSense. All rights reserved.</p>
          <p className="mt-2 text-sm">
            LegalSense provides informational guidance only and does not constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
