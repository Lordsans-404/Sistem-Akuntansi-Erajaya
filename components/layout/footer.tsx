'use client';

import React from 'react';

// Footer global untuk halaman Erajaya Accounting
const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0c] border-t border-gray-900 py-8">
      {/* Wrapper footer */}
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Teks copyright */}
        <p className="text-gray-400 mb-4">
          © 2025 Sistem Akuntansi Erajaya. By Lordsans-404.
        </p>

        {/* Link kebijakan & syarat */}
        <div className="flex justify-center gap-6 text-sm">
          <a
            href="https://github.com/lordsans-404"
            className="text-gray-500 hover:text-[#00bcd4] transition-colors"
          >
            My Page
          </a>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
