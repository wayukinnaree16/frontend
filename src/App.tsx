import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FoundationsList from "./pages/foundations/FoundationsList";
import FoundationDetail from "./pages/foundations/FoundationDetail";
import WishlistDetail from "./pages/wishlist/WishlistDetail";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ForgotPassword from "./pages/auth/ForgotPassword";
import WriteReview from "./pages/donor/WriteReview";
import PledgeForm from "./pages/donor/PledgeForm";
import WishlistList from "./pages/wishlist/WishlistList";
import CreateEditWishlist from "./pages/foundation/CreateEditWishlist";
import UserDetail from "./pages/admin/UserDetail";
import FoundationVerification from "./pages/admin/FoundationVerification";
import FoundationReview from "./pages/admin/FoundationReview";
// Donor Pages
import MyPledges from "./pages/donor/MyPledges";
import Profile from "./pages/donor/Profile";
import Favorites from "./pages/donor/Favorites";

// Foundation Admin Pages
import FoundationDashboard from "./pages/foundation/Dashboard";
import FoundationProfile from "./pages/foundation/Profile";
import FoundationWishlist from "./pages/foundation/Wishlist";
import FoundationPledges from "./pages/foundation/Pledges";
import FoundationDocuments from "./pages/foundation/Documents";

// System Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminFoundations from "./pages/admin/Foundations";
import AdminDonations from "./pages/admin/Donations";
import AdminFoundationTypes from "./pages/admin/FoundationTypes";
import AdminItemCategories from "./pages/admin/ItemCategories";
import AdminLayout from "./components/layout/AdminLayout";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/foundations" element={<FoundationsList />} />
            <Route path="/foundations/:id" element={<FoundationDetail />} />
            <Route path="/wishlist/:id" element={<WishlistDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/wishlist" element={<WishlistList />} />

            {/* Donor Routes */}
            <Route path="/my-pledges" element={<MyPledges />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/write-review" element={<WriteReview />} />
            <Route path="/pledge-form" element={<PledgeForm />} />
            <Route path="/donor/pledge-form" element={<PledgeForm />} />

            {/* Foundation Admin Routes */}
            <Route path="/foundation/dashboard" element={<FoundationDashboard />} />
            <Route path="/foundation/profile" element={<FoundationProfile />} />
            <Route path="/foundation/wishlist" element={<FoundationWishlist />} />
            <Route path="/foundation/pledges" element={<FoundationPledges />} />
            <Route path="/foundation/documents" element={<FoundationDocuments />} />
            <Route path="/foundation/create-edit-wishlist" element={<CreateEditWishlist />} />

            {/* System Admin Routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
            <Route path="/admin/foundations" element={<AdminLayout><AdminFoundations /></AdminLayout>} />
            <Route path="/admin/donations" element={<AdminLayout><AdminDonations /></AdminLayout>} />
            <Route path="/admin/foundation-types" element={<AdminLayout><AdminFoundationTypes /></AdminLayout>} />
            <Route path="/admin/item-categories" element={<AdminLayout><AdminItemCategories /></AdminLayout>} />
            <Route path="/admin/users/:id" element={<AdminLayout><UserDetail /></AdminLayout>} />
            <Route path="/admin/foundation-verification/:id" element={<AdminLayout><FoundationVerification /></AdminLayout>} />
            <Route path="/admin/foundation-review/:foundationId" element={<AdminLayout><FoundationReview /></AdminLayout>} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
