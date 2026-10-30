import { useState } from 'react';
import { 
  Shield, User, Lock, Mail, Fingerprint, 
  Cctv, Wrench, ChevronRight, Activity, AlertCircle, KeyRound, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Auth() {
  const { login, register, isLoading, error: storeError } = useAuthStore();
  
  // 3 Modes: 'LOGIN', 'REGISTER', 'FORGOT_PASSWORD'
  const [authMode, setAuthMode] = useState('LOGIN'); 
  const [selectedRole, setSelectedRole] = useState('SECURITY');
  const [localError, setLocalError] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', badgeId: ''
  });

  const roles = [
    { id: 'ADMIN',    title: 'Command Admin', icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,  accent: 'from-amber-300 via-amber-400 to-orange-500' },
    { id: 'SECURITY', title: 'Security Chief', icon: <Cctv className="w-4 h-4 sm:w-5 sm:h-5" />,   accent: 'from-rose-400 via-red-500 to-orange-500' },
    { id: 'ENGINEER', title: 'Plant Engineer', icon: <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />, accent: 'from-emerald-300 via-teal-400 to-cyan-500' },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(null);
    setResetMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setResetMessage(null);

    if (authMode === 'FORGOT_PASSWORD') {
      // Future: backend API call
      console.log("Password reset requested for:", formData.email);
      setResetMessage("A secure recovery link has been dispatched to your corporate inbox.");
      return;
    }

    let success = false;
    if (authMode === 'LOGIN') {
      success = await login(formData.email, formData.password, selectedRole);
    } else if (authMode === 'REGISTER') {
      success = await register(formData.name, formData.email, formData.password, formData.badgeId, selectedRole);
    }
    if (success) window.location.href = '/'; 
  };

  const displayError = localError || storeError;

  return (
    <div className="relative min-h-screen bg-[#05060a] flex items-center justify-center p-3 sm:p-6 overflow-hidden font-sans text-slate-200 selection:bg-amber-400/30">
      {/* ==== AURORA BACKDROP ==== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 w-72 sm:w-[40rem] h-72 sm:h-[40rem] rounded-full bg-amber-500/10 blur-[80px] sm:blur-[140px]" />
        <div className="absolute -bottom-20 -right-20 sm:-bottom-40 sm:-right-40 w-72 sm:w-[40rem] h-72 sm:h-[40rem] rounded-full bg-cyan-500/10 blur-[80px] sm:blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[20rem] sm:w-[30rem] h-[20rem] sm:h-[30rem] rounded-full bg-rose-500/[0.06] blur-[100px] sm:blur-[160px]" />
        {/* Fine grid mesh */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      {/* ==== MAIN CARD ==== */}
      <div className="relative w-full max-w-5xl z-10">
        {/* Gradient border wrapper */}
        <div className="rounded-[24px] sm:rounded-[28px] p-[1px] bg-gradient-to-br from-white/15 via-white/5 to-transparent shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] sm:shadow-[0_30px_120px_-20px_rgba(0,0,0,0.9)]">
          <div className="rounded-[23px] sm:rounded-[27px] bg-[#0a0c14]/90 backdrop-blur-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

            {/* ============ LEFT: BRANDING (Hidden on Mobile) ============ */}
            <aside className="relative hidden md:flex flex-col justify-between p-8 lg:p-12 border-r border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-[#0a0c14] to-black/80" />
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-400/[0.07] blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/90">
                    Systems Nominal
                  </span>
                </div>

                <div className="mb-8">
                  <h1 className="text-4xl lg:text-[2.75rem] leading-none font-black tracking-tight text-white">
                    IEG
                  </h1>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-[2px] w-8 bg-gradient-to-r from-amber-400 to-transparent" />
                    <span className="text-xs lg:text-sm font-medium uppercase tracking-[0.35em] bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                      Core Access
                    </span>
                  </div>
                </div>

                <p className="text-slate-400 leading-relaxed font-light text-sm lg:text-[15px] max-w-sm">
                  Enterprise-grade access control. Authenticate with your assigned clearance tier.
                  <span className="text-amber-200/80"> Role escalations are audited.</span>
                </p>
              </div>

              <div className="relative z-10 mt-12 lg:mt-16 space-y-3 lg:space-y-4">
                <div className="flex items-center gap-3 p-3 lg:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <Activity className="text-emerald-400 shrink-0" size={18} />
                  <div className="text-xs">
                    <div className="text-slate-500 uppercase tracking-widest text-[9px] lg:text-[10px] mb-0.5">Uptime</div>
                    <div className="text-slate-200 font-semibold">99.998% · Zero incidents</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 lg:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <Sparkles className="text-amber-300 shrink-0" size={18} />
                  <div className="text-xs">
                    <div className="text-slate-500 uppercase tracking-widest text-[9px] lg:text-[10px] mb-0.5">Encryption</div>
                    <div className="text-slate-200 font-semibold">AES-256 · Quantum safe</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ============ RIGHT: FORM (Responsive) ============ */}
            <section className="relative p-6 sm:p-8 lg:p-12">
              <header className="flex items-start justify-between mb-8 sm:mb-10">
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/80 mb-1.5 sm:mb-2">
                    {authMode === 'LOGIN' && 'Secure Gateway'}
                    {authMode === 'REGISTER' && 'Enrollment'}
                    {authMode === 'FORGOT_PASSWORD' && 'Recovery Protocol'}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {authMode === 'LOGIN' && 'Sign In'}
                    {authMode === 'REGISTER' && 'Create Access'}
                    {authMode === 'FORGOT_PASSWORD' && 'Reset Passcode'}
                  </h2>
                </div>

                {authMode !== 'LOGIN' ? (
                  <button
                    onClick={() => { setAuthMode('LOGIN'); setLocalError(null); setResetMessage(null); }}
                    className="text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors duration-200 flex items-center gap-1 group whitespace-nowrap"
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthMode('REGISTER'); setLocalError(null); }}
                    className="text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors duration-200 whitespace-nowrap"
                  >
                    Request Account
                  </button>
                )}
              </header>

              {/* Status alerts */}
              {displayError && (
                <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-2.5 sm:gap-3">
                  <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] sm:text-xs text-rose-300 font-medium leading-relaxed">{displayError}</p>
                </div>
              )}
              {resetMessage && (
                <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5 sm:gap-3">
                  <KeyRound size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] sm:text-xs text-emerald-300 font-medium leading-relaxed">{resetMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

                {/* ---- ROLE SELECTOR ---- */}
                {authMode !== 'FORGOT_PASSWORD' && (
                  <div>
                    <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-2.5 sm:mb-3">
                      Clearance Tier
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                      {roles.map((role) => {
                        const active = selectedRole === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => setSelectedRole(role.id)}
                            className={`group relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                              active
                                ? 'border-white/20 bg-white/[0.06] shadow-[0_0_20px_-5px_rgba(251,191,36,0.25)] sm:shadow-[0_0_25px_-5px_rgba(251,191,36,0.35)]'
                                : 'border-white/[0.06] bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.03]'
                            }`}
                          >
                            {active && (
                              <span className={`absolute inset-x-2 sm:inset-x-4 -top-px h-px bg-gradient-to-r ${role.accent}`} />
                            )}
                            <div
                              className={`transition-all duration-300 ${
                                active
                                  ? `bg-gradient-to-br ${role.accent} bg-clip-text text-transparent scale-110`
                                  : 'text-slate-500 group-hover:text-slate-300'
                              }`}
                            >
                              {role.icon}
                            </div>
                            <span
                              className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] ${
                                active ? 'text-white' : 'text-slate-500'
                              }`}
                            >
                              {role.id}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ---- INPUTS ---- */}
                <div className="space-y-3">
                  {authMode === 'REGISTER' && (
                    <InputField
                      icon={<User size={16} />}
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  )}

                  <InputField
                    icon={<Mail size={16} />}
                    name="email"
                    type="email"
                    placeholder="Corporate Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />

                  {authMode === 'REGISTER' && (
                    <InputField
                      icon={<Fingerprint size={16} />}
                      name="badgeId"
                      type="text"
                      placeholder="Security Badge ID"
                      value={formData.badgeId}
                      onChange={handleInputChange}
                    />
                  )}

                  {authMode !== 'FORGOT_PASSWORD' && (
                    <InputField
                      icon={<Lock size={16} />}
                      name="password"
                      type="password"
                      placeholder="Passcode"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  )}
                </div>

                {authMode === 'LOGIN' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('FORGOT_PASSWORD'); setLocalError(null); }}
                      className="text-[10px] sm:text-[11px] font-medium text-slate-500 hover:text-amber-300 transition-colors duration-200"
                    >
                      Forgot passcode?
                    </button>
                  </div>
                )}

                {/* ---- SUBMIT ---- */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden rounded-xl sm:rounded-2xl p-[1px] bg-gradient-to-r from-amber-400/60 via-amber-200/40 to-orange-400/60 transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 mt-2"
                >
                  <div className="relative flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#0a0c14] px-5 sm:px-6 py-3 sm:py-4 transition-colors duration-300 group-hover:bg-[#0f1119]">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-white">
                      {isLoading ? 'Authenticating…' : (
                        authMode === 'LOGIN' ? 'Initialize Session' :
                        authMode === 'REGISTER' ? 'Request Access' :
                        'Send Recovery Link'
                      )}
                    </span>
                    {!isLoading && (
                      <ChevronRight
                        size={16}
                        className="text-amber-300 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    )}
                  </div>
                </button>

                <p className="text-center text-[9px] sm:text-[10px] text-slate-600 tracking-wide mt-4">
                  Protected by enterprise-grade encryption · All attempts logged
                </p>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ REUSABLE INPUT (JSX) ============ */
function InputField({ icon, name, type, placeholder, value, onChange }) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-200 group-focus-within:text-amber-300">
        {icon}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-amber-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-amber-400/10"
      />
    </div>
  );
}