import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Redirect legacy routes */}
          <Route path="/capabilities" element={<Navigate to="/" replace />} />
          <Route path="/team" element={<Navigate to="/about" replace />} />
          <Route path="/resources" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
