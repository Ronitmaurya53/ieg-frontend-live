import { useState, useEffect, useMemo } from 'react';
import { 
  Server, Activity, Thermometer, Power, Search, 
  AlertCircle, Loader2, X, BarChart2, 
  Gauge, Zap, Cpu, Signal, Radio, 
  TrendingUp, TrendingDown, Minus,
  CheckCircle2, AlertTriangle, XCircle, Download
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';
import jsPDF from 'jspdf';
import { apiClient } from '../api/client';

const STATUS_META = {
  OPTIMAL:  { 
    icon: CheckCircle2, label: 'Online',   
    text: 'text-emerald-300', bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/25', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.25)]',
    dot: 'bg-emerald-400',  accent: 'from-emerald-300 to-teal-500' 
  },
  CRITICAL_RISK: { 
    icon: AlertTriangle, label: 'Critical', 
    text: 'text-amber-300',   bg: 'bg-amber-500/10',   
    border: 'border-amber-500/25',   glow: 'shadow-[0_0_15px_rgba(251,191,36,0.25)]',
    dot: 'bg-amber-400',    accent: 'from-amber-300 to-orange-500' 
  },
  OFFLINE: { 
    icon: XCircle, label: 'Offline', 
    text: 'text-rose-300',    bg: 'bg-rose-500/10',    
    border: 'border-rose-500/25',    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    dot: 'bg-rose-400',     accent: 'from-rose-400 to-red-500' 
  },
  UNKNOWN: { 
    icon: Minus, label: 'Unknown', 
    text: 'text-slate-400',   bg: 'bg-slate-500/10',   
    border: 'border-slate-500/25',   glow: 'shadow-none',
    dot: 'bg-slate-400',    accent: 'from-slate-400 to-slate-500' 
  },
};

const getStatus = (status) => STATUS_META[status] || STATUS_META.UNKNOWN;

export default function Machines() {
  const [searchTerm, setSearchTerm] = useState('');
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const fetchMachines = async () => {
    try {
      const res = await apiClient.get('/machines?limit=1000');
      setMachines(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load machines from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleMachinePower = async (machineId, currentStatus) => {
    const newStatus = currentStatus === 'OFFLINE' ? 'OPTIMAL' : 'OFFLINE';
    setMachines(prev => prev.map(m => (m._id === machineId || m.id === machineId) ? { ...m, status: newStatus } : m));

    try {
      await apiClient.put(`/machines/${machineId}`, { status: newStatus });
    } catch (err) {
      alert("Failed to toggle machine power.");
      fetchMachines();
    }
  };

  const filteredMachines = useMemo(() => {
    if (!searchTerm) return machines; 
    
    const term = searchTerm.toLowerCase();
    return machines.filter(m =>
      (m.name && m.name.toLowerCase().includes(term)) ||
      (m.code && m.code.toLowerCase().includes(term)) ||
      (m._id && m._id.toLowerCase().includes(term))
    );
  }, [machines, searchTerm]);

  const stats = useMemo(() => {
    const counts = { OPTIMAL: 0, CRITICAL_RISK: 0, OFFLINE: 0 };
    machines.forEach(m => { if (counts[m.status] !== undefined) counts[m.status]++; });
    return { total: machines.length, ...counts };
  }, [machines]);

  return (
    <div className="relative space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="pointer-events-none absolute -top-20 -left-10 sm:-top-32 sm:left-1/4 w-72 sm:w-[36rem] h-72 sm:h-[36rem] rounded-full bg-amber-500/[0.04] blur-[80px] sm:blur-[140px] -z-10" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 sm:-bottom-32 sm:right-1/4 w-72 sm:w-[36rem] h-72 sm:h-[36rem] rounded-full bg-cyan-500/[0.04] blur-[80px] sm:blur-[140px] -z-10" />

      {/* HEADER */}
      <header className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/40 to-orange-500/20 blur-md sm:blur-lg" />
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/30 flex items-center justify-center">
              <Server size={18} className="text-amber-300 sm:w-[22px] sm:h-[22px]" />
            </div>
          </div>
          <div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/70 mb-0.5 sm:mb-1">Asset Telemetry</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">Equipment & Analytics</h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Stat Chips (Scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0 shrink-0">
            <StatChip icon={<Signal size={10} className="sm:w-[11px] sm:h-[11px]" />}      label="Total"   value={stats.total}   color="amber"   />
            <StatChip icon={<CheckCircle2 size={10} className="sm:w-[11px] sm:h-[11px]" />} label="Online"  value={stats.OPTIMAL}  color="emerald" />
            <StatChip icon={<AlertTriangle size={10} className="sm:w-[11px] sm:h-[11px]" />} label="Warn"    value={stats.CRITICAL_RISK} color="amber"   />
            <StatChip icon={<XCircle size={10} className="sm:w-[11px] sm:h-[11px]" />}      label="Down"    value={stats.OFFLINE} color="rose"    />
          </div>

          <div className="relative group w-full sm:w-auto shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-300 transition-colors sm:w-[15px] sm:h-[15px]" />
            <input
              type="text"
              placeholder="Search machines…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 lg:w-64 bg-white/[0.02] border border-white/[0.07] rounded-xl pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-amber-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-amber-400/10 focus:w-full sm:focus:w-72 lg:focus:w-72"
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-2.5 sm:gap-3">
          <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
          <p className="text-[11px] sm:text-xs text-rose-300 font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-400/20" />
            <div className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
            <Cpu size={16} className="absolute inset-0 m-auto text-amber-400/50 sm:w-[18px] sm:h-[18px]" />
          </div>
          <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold">Syncing sensors…</p>
        </div>
      ) : filteredMachines.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredMachines.map((machine) => (
            <MachineCard
              key={machine._id || machine.id}
              machine={machine}
              onOpen={() => setSelectedMachine(machine)}
              onTogglePower={() => toggleMachinePower(machine._id || machine.id, machine.status)}
            />
          ))}
        </div>
      )}

      {selectedMachine && (
        <DiagnosticsModal
          machine={selectedMachine}
          onClose={() => setSelectedMachine(null)}
        />
      )}
    </div>
  );
}

/* ============ MACHINE CARD ============ */
function MachineCard({ machine, onOpen, onTogglePower }) {
  const status = getStatus(machine.status);
  const isOffline = machine.status === 'OFFLINE';

  return (
    <div className={`group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent transition-all duration-300 ${isOffline ? 'opacity-80 grayscale-[30%]' : 'hover:from-white/[0.15]'}`}>
      <div className="relative rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-4 sm:p-6 overflow-hidden">
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${status.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <div className="flex justify-between items-start mb-4 sm:mb-5 relative">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-200 transition-colors truncate">
              {machine.name || machine.code}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Radio size={9} className="text-slate-600 sm:w-2.5 sm:h-2.5" />
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono uppercase tracking-wider truncate">
                {machine.code || machine._id}
              </p>
            </div>
          </div>

          <span className={`shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] rounded-full border ${status.text} ${status.bg} ${status.border} ${status.glow}`}>
            <span className="relative flex h-1 sm:h-1.5 w-1 sm:w-1.5">
              {machine.status === 'OPTIMAL' && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.dot} opacity-75`} />
              )}
              <span className={`relative inline-flex rounded-full h-1 sm:h-1.5 w-1 sm:w-1.5 ${status.dot}`} />
            </span>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
          <TelemetryTile icon={<Thermometer size={12} className="sm:w-[13px] sm:h-[13px]" />} label="Temp" value={isOffline ? '--' : 'Live Sync'} accent={isOffline ? 'rose' : 'amber'} />
          <TelemetryTile icon={<Activity size={12} className="sm:w-[13px] sm:h-[13px]" />} label="Vibration" value={isOffline ? '--' : 'Live Sync'} accent={isOffline ? 'rose' : 'cyan'} />
        </div>

        <div className="flex gap-2">
          <button onClick={onOpen} className="group/btn flex-1 relative overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-amber-400/50 via-amber-200/30 to-orange-400/50 transition-transform hover:scale-[1.015] active:scale-[0.99]">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#0a0c14] px-3 sm:px-4 py-2 sm:py-2.5 transition-colors group-hover/btn:bg-[#0f1119] h-full">
              <BarChart2 size={12} className="text-amber-300 sm:w-3.5 sm:h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-white whitespace-nowrap">Diagnostics</span>
            </div>
          </button>

          <button onClick={onTogglePower} className={`shrink-0 p-2 sm:p-2.5 rounded-xl border transition-all ${isOffline ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`} title={isOffline ? "Turn ON Machine" : "Turn OFF Machine"}>
            <Power size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TelemetryTile({ icon, label, value, accent = 'amber' }) {
  const map = {
    amber:   { text: 'text-amber-300',   iconText: 'text-amber-400/70',   bg: 'bg-amber-400/[0.04]',   border: 'border-amber-400/[0.08]' },
    cyan:    { text: 'text-cyan-300',    iconText: 'text-cyan-400/70',    bg: 'bg-cyan-400/[0.04]',    border: 'border-cyan-400/[0.08]' },
    emerald: { text: 'text-emerald-300', iconText: 'text-emerald-400/70', bg: 'bg-emerald-400/[0.04]', border: 'border-emerald-400/[0.08]' },
    rose:    { text: 'text-rose-300',    iconText: 'text-rose-400/70',    bg: 'bg-rose-400/[0.04]',    border: 'border-rose-400/[0.08]' },
  };
  const c = map[accent] || map.amber;

  return (
    <div className={`rounded-xl p-2 sm:p-3 border ${c.bg} ${c.border}`}>
      <div className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold mb-1 ${c.iconText}`}>
        {icon}<span className="truncate">{label}</span>
      </div>
      <div className={`text-xs sm:text-sm font-bold ${c.text} truncate`}>{value}</div>
    </div>
  );
}

/* ============ DIAGNOSTICS MODAL ============ */
function DiagnosticsModal({ machine, onClose }) {
  const status = getStatus(machine.status);
  const [telemetryData, setTelemetryData] = useState([]);

  // FETCH REAL-TIME TELEMETRY FOR THE CHART
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const id = machine._id || machine.id;
        const res = await apiClient.get(`/telemetry/${id}?limit=15`);
        const formatted = res.data.data.map(r => ({
          time: `${new Date(r.timestamp).getHours()}:${new Date(r.timestamp).getMinutes()}`,
          vibration: parseFloat(r.metrics.vibration.toFixed(2)),
          temp: parseFloat(r.metrics.temperature.toFixed(1))
        }));
        setTelemetryData(formatted.reverse());
      } catch (err) {
        console.error("Failed to fetch live telemetry", err);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [machine]);

  // EXPORT PDF REPORT LOGIC
  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFillColor(10, 12, 20); 
    doc.rect(0, 0, 210, 32, 'F');
    doc.setFillColor(52, 211, 153); 
    doc.rect(0, 32, 210, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("IEG ASSET HEALTH REPORT", 14, 20);
    
    doc.setFontSize(9);
    doc.setTextColor(180, 190, 200);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 27);
    
    let yPos = 50;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text(`Machine Name: ${machine.name || machine.code}`, 14, yPos);
    yPos += 10;
    doc.setFontSize(11);
    doc.text(`Machine ID: ${machine._id || machine.id}`, 14, yPos);
    yPos += 8;
    doc.text(`Current Status: ${machine.status}`, 14, yPos);
    
    if(telemetryData.length > 0) {
      const latest = telemetryData[telemetryData.length - 1];
      yPos += 15;
      doc.setFontSize(12);
      doc.text("Latest Telemetry Reading:", 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Temperature: ${latest.temp} °C`, 14, yPos);
      yPos += 6;
      doc.text(`Vibration: ${latest.vibration} mm/s`, 14, yPos);
    } else {
      yPos += 15;
      doc.text("No telemetry data available for this machine.", 14, yPos);
    }
    
    doc.save(`Asset_Report_${machine.code || 'Machine'}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-3xl rounded-[22px] p-[1px] bg-gradient-to-br from-white/15 via-white/[0.05] to-transparent shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] sm:shadow-[0_30px_120px_-20px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="rounded-[21px] bg-[#0a0c14]/95 backdrop-blur-2xl p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col max-h-[90vh]">
          <div className={`absolute -top-16 -right-16 sm:-top-24 sm:-right-24 w-48 sm:w-72 h-48 sm:h-72 rounded-full ${status.bg} blur-[80px] sm:blur-[100px] opacity-60 pointer-events-none`} />

          <div className="relative flex justify-between items-start mb-4 sm:mb-6 pb-4 sm:pb-5 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${status.accent} p-[1px] shrink-0`}>
                <div className="w-full h-full rounded-[10px] bg-[#0a0c14] flex items-center justify-center">
                  <Activity size={16} className={`${status.text} sm:w-[18px] sm:h-[18px]`} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/70 mb-0.5 sm:mb-1">Live Diagnostics</div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">{machine.name || machine.code}</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono uppercase tracking-wider truncate">ID: {machine.code || machine._id}</p>
              </div>
            </div>
            <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3 mb-3 sm:mb-4 shrink-0">
            <div>
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-0.5 sm:mb-1">Real-time Telemetry Stream</div>
              <div className="text-[10px] sm:text-xs text-slate-400">Temperature (°C) & Vibration (mm/s)</div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="relative flex h-1 sm:h-1.5 w-1 sm:w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1 sm:h-1.5 w-1 sm:w-1.5 bg-emerald-400" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Live Sync</span>
            </div>
          </div>

          <div className="relative h-56 sm:h-72 w-full rounded-2xl p-[1px] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent flex-1 min-h-[200px]">
            <div className="h-full w-full bg-[#05060a] rounded-[15px] p-2 sm:p-4">
              {telemetryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetryData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" stopOpacity={0.4} /><stop offset="100%" stopColor="#fbbf24" stopOpacity={0} /></linearGradient>
                      <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2533" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#1e2533' }} tickLine={false} />
                    <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 12, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.8)', padding: '8px' }} labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }} itemStyle={{ fontSize: '10px', paddingTop: '2px' }} />
                    <Line type="monotone" dataKey="temp" stroke="#fbbf24" strokeWidth={2} name="Temp (°C)" dot={{ fill: '#fbbf24', r: 2, strokeWidth: 0 }} activeDot={{ r: 4, fill: '#fbbf24', stroke: '#0a0c14', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="vibration" stroke="#22d3ee" strokeWidth={2} name="Vibration (mm/s)" dot={{ fill: '#22d3ee', r: 2, strokeWidth: 0 }} activeDot={{ r: 4, fill: '#22d3ee', stroke: '#0a0c14', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-[11px] sm:text-sm">
                  Waiting for telemetry data...
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3 shrink-0">
            <button onClick={onClose} className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] border border-white/[0.07] hover:border-white/[0.15] transition-all">Close</button>
            
            <button onClick={downloadReport} className="group relative overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-emerald-400/60 via-emerald-200/40 to-teal-400/60 transition-transform hover:scale-[1.015] active:scale-[0.99]">
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#0a0c14] px-4 sm:px-5 py-2 sm:py-2.5 group-hover:bg-[#0f1119] transition-colors h-full">
                <Download size={12} className="text-emerald-300 sm:w-[13px] sm:h-[13px]" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white">Export</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 sm:gap-4 relative p-4 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-2xl" />
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/5 border border-amber-400/20 flex items-center justify-center">
          <Server size={20} className="text-amber-300/70 sm:w-6 sm:h-6" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-1">No machines found</p>
        <p className="text-[10px] sm:text-[11px] text-slate-500 max-w-xs mx-auto">Try adjusting your search or add equipment to begin monitoring.</p>
      </div>
    </div>
  );
}

function StatChip({ icon, label, value, color }) {
  const map = {
    amber:   { text: 'text-amber-300',   dot: 'bg-amber-400'   },
    emerald: { text: 'text-emerald-300', dot: 'bg-emerald-400' },
    rose:    { text: 'text-rose-300',    dot: 'bg-rose-400'    },
  };
  const c = map[color] || map.amber;

  return (
    <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <span className={c.text}>{icon}</span>
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 hidden sm:inline">{label}</span>
      <span className={`text-[11px] sm:text-xs font-bold ${c.text}`}>{value}</span>
    </div>
  );
}