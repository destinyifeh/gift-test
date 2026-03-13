import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import GiftDetail from "./pages/GiftDetail.tsx";
import GiftPage from "./pages/GiftPage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import VendorDashboard from "./pages/VendorDashboard.tsx";
import VendorPage from "./pages/VendorPage.tsx";
import Developers from "./pages/Developers.tsx";
import CreateCampaign from "./pages/CreateCampaign.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import CampaignPage from "./pages/CampaignPage.tsx";
import Campaigns from "./pages/Campaigns.tsx";
import ClaimGift from "./pages/ClaimGift.tsx";
import CreatorProfile from "./pages/CreatorProfile.tsx";
import ProfileSettings from "./pages/ProfileSettings.tsx";
import PlatformPartner from "./pages/PlatformPartner.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<GiftDetail />} />
          <Route path="/gift/:code" element={<GiftPage />} />
          <Route path="/claim/:code" element={<ClaimGift />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaign/:slug" element={<CampaignPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendors/:slug" element={<VendorPage />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/profile/settings" element={<ProfileSettings />} />
          <Route path="/u/:username" element={<CreatorProfile />} />
          <Route path="/platforms" element={<PlatformPartner />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
