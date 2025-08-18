import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, User, List, Gift, FileText, MessageCircle, LayoutDashboard } from 'lucide-react';

export const FoundationSideMenu: React.FC = () => (
  <aside className="w-64 bg-white border-r shadow-soft py-8 px-4 hidden md:block">
    <nav className="flex flex-col gap-4">
      <Link to="/foundation/dashboard" className="flex items-center gap-3 text-foreground hover:text-primary font-medium">
        <LayoutDashboard className="h-5 w-5" /> Dashboard
      </Link>
      <Link to="/foundation/profile" className="flex items-center gap-3 text-foreground hover:text-primary font-medium">
        <User className="h-5 w-5" /> จัดการโปรไฟล์มูลนิธิ
      </Link>
      <Link to="/foundation/wishlist" className="flex items-center gap-3 text-foreground hover:text-primary font-medium">
        <List className="h-5 w-5" /> จัดการรายการที่ต้องการ
      </Link>
      <Link to="/foundation/pledges" className="flex items-center gap-3 text-foreground hover:text-primary font-medium">
        <Gift className="h-5 w-5" /> จัดการการบริจาค
      </Link>
      <Link to="/foundation/documents" className="flex items-center gap-3 text-foreground hover:text-primary font-medium">
        <FileText className="h-5 w-5" /> จัดการเอกสาร
      </Link>
    </nav>
  </aside>
);
