import { Routes, Route } from "react-router-dom";
import { useEffect }     from "react";
import useUiStore        from "../store/uiStore";

import Login        from "../pages/Login";
import Register     from "../pages/Register";
import Dashboard    from "../pages/Dashboard";
import Workspace    from "../pages/Workspace";
import Settings     from "../pages/Settings";
import NotFound     from "../pages/NotFound";
import OAuthSuccess from "../pages/OAuthSuccess";
import OAuthFailure from "../pages/OAuthFailure";
import GlobalSearch from "../components/layout/GlobalSearch";
import ProtectedRoute from "../components/layout/ProtectedRoute";

export default function AppRoutes() {
  const { openSearch } = useUiStore();

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); openSearch(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [openSearch]);

  return (
    <>
      <GlobalSearch />
      <Routes>
        <Route path="/"         element={<Login />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* OAuth2 callback routes */}
        <Route path="/oauth2/redirect" element={<OAuthSuccess />} />
        <Route path="/oauth2/error"    element={<OAuthFailure />} />

        <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
        <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
    </>
  );
}
