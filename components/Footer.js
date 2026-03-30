import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Instagram, Twitter, Facebook, ArrowRight } from "lucide-react";

export default function Footer() {
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Brand Column */}
          <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-border group-hover:border-primary transition-colors">
                <Image
                  src="/logo/logo.jpeg"
                  alt="Gold Harvesting Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Gold Harvesting
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The ultimate platform for digital gold harvesting. Secure, transparent, and built for your financial growth.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="p-2 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            <h4 className="font-bold text-sm uppercase tracking-wider text-foreground mb-4 md:mb-6">
              Contact Us
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full max-w-lg md:max-w-none">
              <div className="group p-4 bg-muted/30 rounded-xl border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-1 justify-start">
                  <div className="p-1.5 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Phone size={14} className="text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone Support</span>
                </div>
                <a
                  href={`tel:${adminPhone.replace(/\s+/g, '')}`}
                  className="text-base font-bold text-foreground hover:text-primary transition-colors block pl-9"
                >
                  {adminPhone}
                </a>
              </div>

              <div className="group p-4 bg-muted/30 rounded-xl border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-1 justify-start">
                  <div className="p-1.5 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Mail size={14} className="text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Support</span>
                </div>
                <a
                  href="mailto:support@goldharvesting.com"
                  className="text-base font-bold text-foreground hover:text-primary transition-colors block pl-9"
                >
                  kampomidojewellers@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-8 md:mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">
            &copy; {currentYear} Gold Harvesting Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">
              Secure Digital Gold Management
            </span>
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1.5 text-xs text-primary font-bold group cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowRight size={14} className="-rotate-90 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}