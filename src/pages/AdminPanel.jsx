import { useState, useEffect } from 'react';
import { 
  Shield, Trash2, UserPlus, Users, Activity, 
  Mail, Lock, Fingerprint, ChevronDown, 
  AlertCircle, CheckCircle2, Search, MoreHorizontal,
  Crown, Wrench, Radio
} from 'lucide-react';
import { apiClient } from '../api/client';

const ROLES = [
  { value: 'ADMIN',    label: 'Command Admin',  icon: Crown,   accent: 'from-amber-300 via-amber-400 to-orange-500',   chip: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  { value: 'SECURITY', label: 'Security Chief', icon: Shield,  accent: 'from-rose-400 via-red-500 to-orange-500',       chip: 'bg-rose-500/10 text-rose-300 border-rose-500/20' },
  { value: 'ENGINEER', label: 'Plant Engineer', icon: Wrench,  accent: 'from-emerald-300 via-teal-400 to-cyan-500',     chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  { value: 'OPERATOR', label: 'Operator',       icon: Radio,   accent: 'from-sky-300 via-blue-400 to-indigo-500',       chip: 'bg-sky-500/10 text-sky-300 border-sky-500/20' },
];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', badgeId: '', role: 'SECURITY' 
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      showToast('error', error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', formData);
      setFormData({ name: '', email: '', password: '', badgeId: '', role: 'SECURITY' });
      showToast('success', `Access provisioned for ${formData.name || 'new user'}`);
      fetchUsers();
    } catch (error) {
      showToast('error', error.response?.data?.message || "Failed to add user");
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      showToast('success', 'Access revoked successfully');
    } catch (error) {
      showToast('error', error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.badgeId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/20" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
        </div>
        <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-semibold">
          Loading Command Center…
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[40rem] h-[40rem] rounded-full bg-amber-500/[0.04] blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 w-[30rem] h-[30rem] rounded-full bg-cyan-500/[0.04] blur-[140px]" />

      {/* ===== HEADER ===== */}
      <header className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/40 to-orange-500/20 blur-lg" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/30 flex items-center justify-center">
              <Shield size={22} className="text-amber-300" />
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/70 mb-1">
              Command Center
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Admin Control Panel
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              Live · {users.length} active
            </span>
          </div>
        </div>
      </header>

      {/* ===== GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ===== ADD USER FORM ===== */}
        <div className="lg:col-span-2 relative">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
            <div className="rounded-[15px] bg-[#0a0c14]/80 backdrop-blur-xl p-6">

              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <UserPlus size={16} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Provision Access</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">New personnel</p>
                </div>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3">
                <FormInput
                  icon={<UserIcon />}
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={v => setFormData({ ...formData, name: v })}
                  type="text"
                />
                <FormInput
                  icon={<Mail size={16} />}
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={v => setFormData({ ...formData, email: v })}
                  type="email"
                />
                <FormInput
                  icon={<Lock size={16} />}
                  placeholder="Temporary Password"
                  value={formData.password}
                  onChange={v => setFormData({ ...formData, password: v })}
                  type="password"
                />
                <FormInput
                  icon={<Fingerprint size={16} />}
                  placeholder="Badge ID"
                  value={formData.badgeId}
                  onChange={v => setFormData({ ...formData, badgeId: v })}
                  type="text"
                />

                {/* Role selector */}
                <div className="pt-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-2">
                    Clearance Tier
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full appearance-none bg-white/[0.02] border border-white/[0.07] rounded-xl pl-4 pr-10 py-3 text-sm text-white outline-none transition-all focus:border-amber-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-amber-400/10 cursor-pointer"
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value} className="bg-[#0a0c14]">
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="group relative w-full mt-4 overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-amber-400/60 via-amber-200/40 to-orange-400/60 transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99]"
                >
                  <div className="relative flex items-center justify-center gap-2 rounded-xl bg-[#0a0c14] px-6 py-3 transition-colors group-hover:bg-[#0f1119]">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-white">
                      Authorize User
                    </span>
                    <UserPlus size={14} className="text-amber-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ===== USERS TABLE ===== */}
        <div className="lg:col-span-3 relative">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent h-full">
            <div className="rounded-[15px] bg-[#0a0c14]/80 backdrop-blur-xl p-6 h-full flex flex-col">

              {/* Table header */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                    <Users size={16} className="text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Active Personnel</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      {filteredUsers.length} of {users.length} shown
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative group hidden sm:block">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-40 bg-white/[0.02] border border-white/[0.07] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-amber-400/40 focus:bg-white/[0.04] focus:w-52"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-6 px-6 flex-1">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/[0.06]">
                      <th className="pb-3 pr-4">Personnel</th>
                      <th className="pb-3 pr-4">Clearance</th>
                      <th className="pb-3 pr-4">Badge ID</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center">
                          <Users size={32} className="mx-auto text-slate-700 mb-3" />
                          <p className="text-xs text-slate-600 uppercase tracking-[0.25em]">
                            No personnel found
                          </p>
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((user) => {
                      const roleMeta = ROLES.find(r => r.value === user.role) || ROLES[1];
                      const RoleIcon = roleMeta.icon;
                      const isConfirming = confirmId === user._id;
                      const isDeleting = deletingId === user._id;

                      return (
                        <tr
                          key={user._id}
                          className="group border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleMeta.accent} p-[1px] shrink-0`}>
                                <div className="w-full h-full rounded-[10px] bg-[#0a0c14] flex items-center justify-center text-white text-xs font-black">
                                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${roleMeta.chip}`}>
                              <RoleIcon size={11} />
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="font-mono text-xs text-slate-400">
                              {user.badgeId || '—'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {isConfirming ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  disabled={isDeleting}
                                  className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-all disabled:opacity-50"
                                >
                                  {isDeleting ? '…' : 'Revoke'}
                                </button>
                                <button
                                  onClick={() => setConfirmId(null)}
                                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1.5 rounded-lg border border-white/[0.06] transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmId(user._id)}
                                className="text-slate-500 hover:text-rose-300 bg-white/[0.02] hover:bg-rose-500/10 p-2 rounded-lg border border-transparent hover:border-rose-500/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Revoke access"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOAST ===== */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}>
            {toast.type === 'success'
              ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
            <p className="text-xs font-medium max-w-xs">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Helpers ===== */
function UserIcon() {
  return <UserPlus size={16} />;
}

function FormInput({ icon, placeholder, value, onChange, type = 'text' }) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-300">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/[0.02] border border-white/[0.07] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-amber-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-amber-400/10"
      />
    </div>
  );
}