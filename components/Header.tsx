"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ConnectWalletButton } from "./ConnectWalletButton";
import Image from "next/image";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/docs", label: "Docs" },
    { href: "/about", label: "About" },
    { href: "/explore", label: "Explore" },
  ];

  return (
    <header className=" bg-[#191919] border-[#292929] border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">

          <Link 
            href="/" 
            className="flex items-center text-xl font-serif text-white hover:text-gray-300 transition-colors duration-200"
          >
            <Image src="/logo.png" width={120} height={50} alt="Dargent" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[15px] font-normal text-gray-300 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Wallet Button */}
          <div className="hidden md:block">
            <ConnectWalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="py-6 space-y-1 border-t border-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-[15px] font-normal text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-4">
              <ConnectWalletButton />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;