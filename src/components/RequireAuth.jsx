import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Shield, Lock } from 'lucide-react';

/**
 * Safely decode a JWT payload without external libs.
 * Returns null if the token is malformed.
 */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // Base64url → Base64
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
      .padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * Check if a JWT is expired.
 * Returns false if no exp claim exists (treat as non-expiring).
 */
function isTokenExpired(token) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return false;
  return Date.now() >= decoded.exp * 1000;
}

export default function RequireAuth({ children }) {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Verify once per mount (and re-run when location changes)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) {
      setIsAuthorized(false);
      setIsVerifying(false);
      return;
    }

    // Safely parse user object
    let user = null;
    try {
      user = JSON.parse(userRaw);
    } catch {
      // Corrupt user data — clear and reject
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsAuthorized(false);
      setIsVerifying(false);
      return;
    }

    // Basic sanity check
    if (!user || typeof user !== 'object' || !user.role) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsAuthorized(false);
      setIsVerifying(false);
      return;
    }

    // Check JWT expiry (only if token looks like a JWT)
    if (token.split('.').length === 3 && isTokenExpired(token)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsAuthorized(false);
      setIsVerifying(false);
      return;
    }

    setIsAuthorized(true);
    setIsVerifying(false);
  }, [location.pathname]);

  // === Loading state ===
  if (isVerifying) {
    return <AuthLoadingScreen />;
  }

  // === Not authorized — redirect to login ===
  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // === Authorized — render children ===
  return children;
}

/* ============ PREMIUM LOADING SCREEN ============ */
function AuthLoadingScreen() {
  return (
    <div className="relative min-h-screen bg-[#05060a] flex items-center justify-center overflow-hidden font-sans">
      {/* Aurora backdrop - Optimized for mobile */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 w-72 h-72 sm:w-[40rem] sm:h-[40rem] rounded-full bg-amber-500/[0.08] blur-[80px] sm:blur-[140px]" />
        <div className="absolute -bottom-20 -right-20 sm:-bottom-40 sm:-right-40 w-72 h-72 sm:w-[40rem] sm:h-[40rem] rounded-full bg-cyan-500/[0.08] blur-[80px] sm:blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-5 sm:gap-6 z-10">
        {/* Lock icon with pulsing glow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-400/30 blur-xl sm:blur-2xl animate-pulse" />
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/30 flex items-center justify-center">
            <Shield size={22} className="text-amber-300 sm:w-[26px] sm:h-[26px]" />
            <Lock
              size={10}
              className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-amber-400"
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Spinner ring */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.04]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-400/40 animate-spin" />
        </div>

        {/* Text */}
        <div className="text-center">
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-amber-300/70 mb-1.5 sm:mb-2">
            Authenticating
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Verifying clearance…
          </p>
        </div>
      </div>
    </div>
  );
}