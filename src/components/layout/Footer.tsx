import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-background border-t py-8 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <span className="font-bold text-primary">Giving Heart Thailand</span> &copy; {new Date().getFullYear()}
        </div>
        <div className="flex space-x-6">
          <a href="/about" className="text-muted-foreground hover:text-primary">เกี่ยวกับเรา</a>
          <a href="/faq" className="text-muted-foreground hover:text-primary">FAQ</a>
          <a href="/privacy" className="text-muted-foreground hover:text-primary">นโยบายความเป็นส่วนตัว</a>
        </div>
      </div>
    </footer>
  );
};