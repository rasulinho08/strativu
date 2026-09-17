import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import { Platform, PlatformGRC, Architecture } from "./pages/Platform";
import { Coverage, FrameworkPage } from "./pages/Coverage";
import { About, Contact, EarlyAccess, Trust } from "./pages/Company";
import { Changelog, Legal } from "./pages/Misc";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/platform/grc" element={<PlatformGRC />} />
          <Route path="/platform/architecture" element={<Architecture />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/coverage/:slug" element={<FrameworkPage />} />
          <Route path="/company" element={<Navigate to="/company/about" replace />} />
          <Route path="/company/about" element={<About />} />
          <Route path="/company/contact" element={<Contact />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/early-access" element={<EarlyAccess />} />
          <Route path="/legal/:doc" element={<Legal />} />
          {/* Legacy routes */}
          <Route path="/about" element={<Navigate to="/company/about" replace />} />
          <Route path="/contact" element={<Navigate to="/company/contact" replace />} />
          <Route path="/work" element={<Navigate to="/platform/grc" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
