import { useState, useEffect } from 'react';
import { 
  Activity, AlertOctagon, CheckCircle2, Server, Plus, 
  BrainCircuit, History, UploadCloud, Search, Sliders,
  LayoutDashboard, FlaskConical, Video, ShieldAlert, Camera, CameraOff, 
  Flame, Download, Bell, ScanFace, Volume2, X, 
  Cctv, Radio, Zap, Cpu, TrendingUp, Play, Square,
  Maximize2, FileVideo, UserSearch, PowerOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import { apiClient } from '../api/client';
import LiveSurveillance from '../components/LiveSurveillance';

// ==========================================
// 🔊 EMERGENCY ALARM SOUND (Browser Native)
// ==========================================
const playEmergencyAlarm = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5); 
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime); 
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (error) {
    console.log("Audio play blocked by browser. Click anywhere on page first.");
  }
};

const TABS = [
  { id: 'cctv',     label: 'Live Security',  icon: Cctv,          accent: 'from-rose-400 to-red-500' },
  { id: 'overview', label: 'IoT Overview',   icon: LayoutDashboard, accent: 'from-amber-300 to-orange-500' },
  { id: 'ml',       label: 'ML Sandbox',     icon: FlaskConical,  accent: 'from-orange-400 to-rose-500' },
  { id: 'forensic', label: 'Forensic AI',    icon: Video,         accent: 'from-cyan-300 to-blue-500' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('cctv'); 
  const [isCameraOn, setIsCameraOn] = useState(false); 
  const [isEmergencyActive, setIsEmergencyActive] = useState(false); 
  const [autoCutEnabled, setAutoCutEnabled] = useState(true);
  const [alarmTone, setAlarmTone] = useState('classic');

  const [machines, setMachines] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [riskProfile, setRiskProfile] = useState(null);
  const [criticalWarning, setCriticalWarning] = useState(null);
  
  const [videoFile, setVideoFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [forensicResults, setForensicResults] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); 

  const [manualMetrics, setManualMetrics] = useState({ temperature: 75, vibration: 2.5, pressure: 100, rotationalSpeed: 3000 });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [mlFaces, setMlFaces] = useState([]);
  const [isFireDetected, setIsFireDetected] = useState(false);

  // ===== Auto-repeating siren & ML sync (CCTV) =====
  useEffect(() => {
    let interval;
    if (isCameraOn) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('https://ieg-ml-live.onrender.com/api/live_detections');
          const data = await res.json();
          setMlFaces(data.faces || []);
          if (data.fire_detected) {
            setIsFireDetected(true);
            if (!isEmergencyActive) {
              setIsEmergencyActive(true);
              playEmergencyAlarm();
              setTimeout(() => setIsEmergencyActive(false), 3500);
            }
          } else {
            setIsFireDetected(false);
          }
        } catch (error) {
          console.error("ML Backend Offline.");
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isCameraOn, isEmergencyActive, alarmTone]);

  const simulatePerfectDetection = () => {
    setIsFireDetected(true);
    setIsEmergencyActive(true);
    playEmergencyAlarm();
    setMlFaces([
      { name: "Unknown Suspect", status: "Unauthorized Access", confidence: 98.7, photo: "https://i.pravatar.cc/150?img=11" },
      { name: "Employee ID: 442", status: "Trapped in Zone A", confidence: 94.2, photo: "https://i.pravatar.cc/150?img=33" },
    ]);
    setIsCameraOn(true);
    setTimeout(() => setIsEmergencyActive(false), 3500); 
  };

  const clearAlarms = () => {
    setIsFireDetected(false);
    setIsEmergencyActive(false);
    setMlFaces([]);
  };

  const handleTriggerAlarm = () => {
    setIsEmergencyActive(true);
    playEmergencyAlarm();
    setTimeout(() => setIsEmergencyActive(false), 3500);
  };

  const downloadPDFReport = () => {
    const doc = new jsPDF();
    doc.setFillColor(10, 12, 20); 
    doc.rect(0, 0, 210, 32, 'F');
    doc.setFillColor(251, 191, 36);
    doc.rect(0, 32, 210, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("IEG COMMAND CENTER", 14, 20);
    doc.setFontSize(9);
    doc.setTextColor(180, 190, 200);
    doc.text(`Shift Incident Forensic Report • ${new Date().toLocaleString()}`, 14, 27);
    let yPos = 50;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`System Status: Operational`, 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Note: Real-time alerts are logged directly via ML Backend.`, 14, yPos);
    doc.save(`IEG_Command_Report_${Date.now()}.pdf`);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/machines');
      setMachines(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setSelectedMachine(res.data.data[0]);
        fetchTelemetryAndRisk(res.data.data[0]._id);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchTelemetryAndRisk = async (machineId) => {
    try {
      const res = await apiClient.get(`/telemetry/${machineId}?limit=15`);
      setTelemetry(res.data.data.map(r => ({
        time: `${new Date(r.timestamp).getHours()}:${new Date(r.timestamp).getMinutes()}`,
        vibration: r.metrics.vibration.toFixed(2), temp: r.metrics.temperature.toFixed(1)
      })));
      if (res.data.data.length > 0) {
        const riskRes = await apiClient.get(`/telemetry/${machineId}/risk`);
        setRiskProfile(riskRes.data.data);
        
        if (riskRes.data.data?.matchedHistoricalIncidents?.[0]?.similarity > 0.6) {
          setCriticalWarning(riskRes.data.data);
        } else {
          setCriticalWarning(null);
        }
      } else {
        setRiskProfile(null);
        setCriticalWarning(null);
      }
    } catch (error) {}
  };

  const injectManualData = async () => {

    localStorage.setItem('ieg_autocut_active', autoCutEnabled ? 'true' : 'false');
    if (!selectedMachine) return;
    try {
      await apiClient.post('/telemetry', { machineId: selectedMachine._id, metrics: manualMetrics });
      await fetchTelemetryAndRisk(selectedMachine._id);
      
      const isCritical = manualMetrics.temperature > 85 || manualMetrics.vibration > 6.0;

      if (isCritical) {
        // 🚨 DONO CASE MEIN ALARM AUR RED SCREEN START (Dhamaka!)
        setIsEmergencyActive(true);
        playEmergencyAlarm();

        if (autoCutEnabled) {
          // AUTO-CUT ON: System disconnected (Status 'SYSTEM_CUT' bhej rahe hain edges chupane ke liye)
          setMachines(prev => prev.map(m => m._id === selectedMachine._id ? { ...m, status: 'SYSTEM_CUT' } : m));
        } else {
          // AUTO-CUT OFF: System jal raha hai (Status 'CRITICAL_RISK' edges ko laal karne ke liye)
          setMachines(prev => prev.map(m => m._id === selectedMachine._id ? { ...m, status: 'CRITICAL_RISK' } : m));
        }

        // 4.5 sec baad red screen band
        setTimeout(() => setIsEmergencyActive(false), 4500); 

      } else {
        // Agar temp normal kiya toh sab theek (OPTIMAL)
        setIsEmergencyActive(false);
        setMachines(prev => prev.map(m => m._id === selectedMachine._id ? { ...m, status: 'OPTIMAL' } : m));
      }

    } catch (error) {
      console.error(error);
    }
  };
  
  const handleForensicScan = async () => {
    if (!videoFile) return alert("Please select a video file first!");
    setIsScanning(true);
    setForensicResults(null);
    const formData = new FormData();
    formData.append("file", videoFile);
    try {
      const res = await fetch("https://ieg-ml-live.onrender.com/api/investigate", { method: "POST", body: formData });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setForensicResults(data.data);
    } catch (error) {
      alert("Error scanning video. Ensure Python FastAPI is running on port 8000!");
    } finally {
      setIsScanning(false);
    }
  };

  const generateDemoData = async () => {
    setSeeding(true);
    try {
      const facRes = await apiClient.post('/facilities', { name: "Gorakhpur Main Plant", code: `PLT-${Math.floor(Math.random()*1000)}`, location: "Gorakhpur, UP" });
      const machRes = await apiClient.post('/machines', { facilityId: facRes.data.data._id, code: `PUMP-${Math.floor(Math.random()*1000)}`, name: "Cooling Water Pump A", type: "CENTRIFUGAL_PUMP" });
      for (let i = 0; i < 9; i++) {
        await apiClient.post('/telemetry', { machineId: machRes.data.data._id, metrics: { temperature: 75 + Math.random() * 5, vibration: 2 + Math.random() * 1, pressure: 100, rotationalSpeed: 3000 } });
      }
      await apiClient.post('/telemetry', { machineId: machRes.data.data._id, metrics: { temperature: 95.5, vibration: 8.2, pressure: 120, rotationalSpeed: 3200 } });
      await fetchDashboardData();
    } catch (error) {} finally { setSeeding(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const optimalCount = machines.filter(m => m.status === 'OPTIMAL').length;
  const criticalCount = machines.filter(m => m.status === 'CRITICAL_RISK' || m.status === 'OFFLINE' || m.status === 'SYSTEM_CUT').length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-amber-400/20" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
          <Cpu size={18} className="absolute inset-0 m-auto text-amber-400/50" />
        </div>
        <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-semibold">
          Initializing Command Center…
        </p>
      </div>
    );
  }

  if (machines.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-2xl" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/5 border border-amber-400/20 flex items-center justify-center">
            <Server size={28} className="text-amber-300/70 sm:w-8 sm:h-8" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold text-white mb-1">No Machines Found</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mb-6">Initialize the plant with demo data to begin monitoring.</p>
          <button onClick={generateDemoData} disabled={seeding} className="group relative overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-amber-400/60 via-amber-200/40 to-orange-400/60 transition-transform hover:scale-[1.015] active:scale-[0.99] disabled:opacity-50">
            <div className="flex items-center gap-2 rounded-xl bg-[#0a0c14] px-5 sm:px-6 py-2.5 sm:py-3 group-hover:bg-[#0f1119] transition-colors">
              <Plus size={16} className="text-amber-300" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white">{seeding ? 'Generating…' : 'Generate Demo Data'}</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const bgClass = isEmergencyActive ? "bg-red-950 transition-colors duration-200" : "";

  return (
    <div className={`relative flex flex-col lg:flex-row gap-4 lg:gap-6 pb-12 ${bgClass}`}>
      {/* Ambient glowing circles */}
      <div className={`pointer-events-none absolute -top-20 -left-10 sm:-top-32 sm:left-1/3 w-72 sm:w-[40rem] h-72 sm:h-[40rem] rounded-full blur-[80px] sm:blur-[140px] -z-10 ${isEmergencyActive ? 'bg-red-600/20 animate-pulse' : 'bg-amber-500/[0.03]'}`} />
      <div className={`pointer-events-none absolute -bottom-20 -right-10 sm:-bottom-32 sm:right-1/4 w-72 sm:w-[40rem] h-72 sm:h-[40rem] rounded-full blur-[80px] sm:blur-[140px] -z-10 ${isEmergencyActive ? 'bg-red-600/20 animate-pulse' : 'bg-cyan-500/[0.03]'}`} />

      {/* Warning Modal */}
      {criticalWarning && (
        <CriticalWarningModal warning={criticalWarning} onClose={() => setCriticalWarning(null)} />
      )}

      {/* ===== SIDEBAR (Becomes Top Nav on Mobile) ===== */}
      <aside className="w-full lg:w-64 shrink-0 z-10">
        <div className={`lg:sticky lg:top-6 rounded-2xl p-[1px] ${isEmergencyActive ? 'bg-red-500/50 animate-pulse' : 'bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent'}`}>
          <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-3 sm:p-4 lg:space-y-5">
            {/* Header (Hidden on mobile to save space, assuming main layout has header) */}
            <div className="hidden lg:flex items-center gap-3 px-2 pb-4 border-b border-white/[0.06]">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-amber-400/30 blur-md" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/30 flex items-center justify-center">
                  <ShieldAlert size={16} className="text-amber-300" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-300/70">IEG</div>
                <div className="text-xs font-bold text-white">Command Center</div>
              </div>
            </div>

            {/* Nav Tabs (Horizontal scroll on mobile, Vertical on Desktop) */}
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide snap-x">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 snap-start relative lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition-all group ${
                      active ? 'bg-white/[0.06] border border-white/10' : 'border border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
                    }`}
                  >
                    {active && <span className={`hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${tab.accent}`} />}
                    <Icon size={14} className={`sm:w-4 sm:h-4 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}`} />
                    <span className={`text-[11px] sm:text-xs font-semibold tracking-wide whitespace-nowrap ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200 transition-colors'}`}>{tab.label}</span>
                    {active && <span className={`hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-br ${tab.accent} shadow-[0_0_8px_rgba(251,191,36,0.6)]`} />}
                  </button>
                );
              })}
            </nav>

            {/* Controls (Hidden on very small mobile, visible in desktop or accordion if needed) */}
            <div className="hidden lg:block pt-4 border-t border-white/[0.06] space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-2 px-1">
                  <Volume2 size={11} /> Alarm Tone
                </label>
                <div className="relative">
                  <select
                    value={alarmTone}
                    onChange={(e) => setAlarmTone(e.target.value)}
                    className="w-full appearance-none bg-white/[0.02] border border-white/[0.07] rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all focus:border-amber-400/40 focus:bg-white/[0.04] cursor-pointer"
                  >
                    <option value="classic" className="bg-[#0a0c14]">🚨 Classic Siren</option>
                    <option value="digital" className="bg-[#0a0c14]">📟 Digital Beeps</option>
                    <option value="nuclear" className="bg-[#0a0c14]">☢️ Nuclear Pulse</option>
                  </select>
                </div>
              </div>
              <button onClick={handleTriggerAlarm} className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 hover:border-rose-500/40 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all">
                <Bell size={12} /> Test Alarm
              </button>
              <button onClick={downloadPDFReport} className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 hover:border-amber-500/40 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all">
                <Download size={12} /> Export Report
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 min-w-0 space-y-5 lg:space-y-6">
        {activeTab === 'cctv'     && <CCTVTab     {...{ isFireDetected, clearAlarms, isCameraOn, setIsCameraOn, simulatePerfectDetection, mlFaces, setSelectedImage }} />}
        {activeTab === 'overview' && <OverviewTab {...{ optimalCount, criticalCount, machines, selectedMachine, setSelectedMachine, fetchTelemetryAndRisk, telemetry }} />}
        {activeTab === 'ml'       && <MLTab       {...{ manualMetrics, setManualMetrics, injectManualData, riskProfile, isEmergencyActive, autoCutEnabled, setAutoCutEnabled, selectedMachine }} />}
        {activeTab === 'forensic' && <ForensicTab {...{ videoFile, setVideoFile, handleForensicScan, isScanning, forensicResults, setSelectedImage }} />}
      </main>

      {/* ===== IMAGE ENLARGE MODAL ===== */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[300] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full flex justify-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="Enlarged" className="max-h-[80vh] w-auto object-contain rounded-2xl border border-white/15 shadow-[0_30px_120px_-20px_rgba(0,0,0,0.9)]" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 flex items-center gap-1.5 sm:gap-2 text-white bg-white/[0.06] hover:bg-rose-500/20 hover:border-rose-500/30 border border-white/15 backdrop-blur-xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] transition-all">
              <X size={12} className="sm:w-3.5 sm:h-3.5" /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== CRITICAL WARNING MODAL ========== */
function CriticalWarningModal({ warning, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-[22px] p-[1px] bg-gradient-to-br from-rose-400/60 via-rose-500/30 to-transparent shadow-[0_30px_120px_-20px_rgba(244,63,94,0.5)] animate-in zoom-in-95 duration-300">
        <div className="relative rounded-[21px] bg-[#0a0c14]/95 backdrop-blur-2xl p-5 sm:p-8 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-rose-500/20 blur-[100px] animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-rose-500/10 blur-[100px] animate-pulse" />

          <div className="relative text-center">
            <div className="relative inline-flex mb-4 sm:mb-5">
              <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-xl animate-pulse" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.6)]">
                <ShieldAlert size={24} className="text-white animate-bounce sm:w-[30px] sm:h-[30px]" />
              </div>
            </div>

            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-rose-300/80 mb-1.5 sm:mb-2">System Warning</div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1.5 sm:mb-2 leading-tight">Catastrophic Failure Predicted</h2>
            <p className="text-[11px] sm:text-xs text-rose-300 mb-5 sm:mb-6">AI model detected critical anomaly pattern requiring immediate action.</p>

            <div className="bg-rose-500/5 border border-rose-500/25 rounded-xl p-3 sm:p-4 text-left mb-5 sm:mb-6 space-y-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-rose-400 mb-1">Root Cause</div>
                <p className="text-xs sm:text-sm text-white font-semibold line-clamp-2">{warning.primaryDriver}</p>
              </div>
              <div className="pt-3 border-t border-rose-500/15">
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-rose-400 mb-1">Historical Match</div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-0">
                  <p className="text-xs sm:text-sm text-white font-semibold">{warning.matchedHistoricalIncidents[0]?.incidentCode}</p>
                  <span className="self-start sm:self-auto text-[10px] sm:text-[11px] font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/25">
                    {(warning.matchedHistoricalIncidents[0]?.similarity * 100).toFixed(1)}% Match
                  </span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="w-full group relative overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-rose-400/60 via-rose-500/40 to-red-500/60 transition-transform hover:scale-[1.015] active:scale-[0.99]">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#0a0c14] px-5 sm:px-6 py-3 sm:py-3.5 group-hover:bg-[#0f1119] transition-colors">
                <AlertOctagon size={14} className="text-rose-300 sm:w-4 sm:h-4" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white">Initiate Safe Shutdown</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== TAB 1: CCTV ========== */
function CCTVTab({ isFireDetected, clearAlarms, isCameraOn, setIsCameraOn, simulatePerfectDetection, mlFaces, setSelectedImage }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {isFireDetected && (
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-rose-500/60 via-orange-500/40 to-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-[15px] bg-rose-950/50 backdrop-blur-xl p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-rose-500/50 blur-lg animate-pulse" />
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                  <Flame size={18} className="text-white sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <h2 className="text-[11px] sm:text-sm font-black text-rose-300 uppercase tracking-[0.15em]">Emergency · Fire Confirmed</h2>
                <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">Large heat signature detected. Siren repeating.</p>
              </div>
            </div>
            <button onClick={clearAlarms} className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 hover:border-rose-400/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all">
              Silence Alarm
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
          <div className="relative rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-3 sm:p-5 overflow-hidden">
            {isFireDetected && <div className="absolute inset-0 rounded-[15px] border-2 border-rose-500/70 pointer-events-none animate-pulse z-20" />}
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shrink-0 ${isCameraOn ? 'bg-emerald-400/10 border-emerald-400/25' : 'bg-white/[0.02] border-white/[0.07]'}`}>
                  <Camera size={14} className={isCameraOn ? 'text-emerald-300 sm:w-4 sm:h-4' : 'text-slate-500 sm:w-4 sm:h-4'} />
                  {isCameraOn && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">Live CCTV Feed</h3>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-500">{isCameraOn ? 'Recording · 1080p' : 'Offline'}</p>
                </div>
              </div>
              
              <div className="flex gap-2 self-end sm:self-auto w-full sm:w-auto">
                <button onClick={simulatePerfectDetection} className="flex-1 sm:flex-none text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 hover:border-orange-500/40 px-2 sm:px-3 py-2 rounded-lg transition-all text-center">
                  Simulate Threat
                </button>
                <button onClick={() => setIsCameraOn(!isCameraOn)} className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] px-2 sm:px-3 py-2 rounded-lg border transition-all ${isCameraOn ? 'text-rose-300 bg-rose-500/10 border-rose-500/25 hover:bg-rose-500/20' : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20'}`}>
                  {isCameraOn ? <Square size={10} /> : <Play size={10} />}
                  {isCameraOn ? 'Stop' : 'Start'}
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/[0.06]">
              {isCameraOn ? (
                <>
                <LiveSurveillance />
                  {/* <img src="https://ieg-ml-live.onrender.com/api/video_feed" alt="Live CCTV" className="w-full h-full object-contain" /> */}
                  <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)' }} />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-4 sm:w-5 h-4 sm:h-5 border-l-2 border-t-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-4 sm:w-5 h-4 sm:h-5 border-r-2 border-t-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 w-4 sm:w-5 h-4 sm:h-5 border-l-2 border-b-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-4 sm:w-5 h-4 sm:h-5 border-r-2 border-b-2 border-amber-400/60 pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                  <CameraOff size={32} className="mb-2 sm:mb-3 opacity-40 sm:w-10 sm:h-10" />
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-bold">Feed Offline</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
          <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-3 sm:p-5 flex flex-col h-[300px] lg:h-full lg:max-h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <ScanFace size={14} className="text-amber-300 sm:w-4 sm:h-4" />
                <h3 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-[0.15em]">AI Recognition</h3>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${mlFaces.length > 0 ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/25' : 'text-slate-500 bg-white/[0.02] border border-white/[0.06]'}`}>
                {mlFaces.length} detected
              </span>
            </div>

            {mlFaces.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                {mlFaces.map((person, idx) => (
                  <div key={idx} className="group flex items-center gap-2 sm:gap-3 bg-white/[0.02] p-2 sm:p-2.5 rounded-xl border border-white/[0.06] hover:border-amber-400/30 hover:bg-white/[0.04] transition-all animate-in slide-in-from-right-2">
                    <div className="relative shrink-0">
                      <img src={person.photo} alt="Face" onClick={() => setSelectedImage(person.photo)} className="w-9 h-9 sm:w-11 sm:h-11 object-cover rounded-lg border border-white/10 cursor-pointer group-hover:border-amber-400/50 transition-colors" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] border border-[#0a0c14]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] sm:text-xs font-bold text-white truncate">{person.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 truncate mt-0.5">{person.status}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[7px] sm:text-[8px] text-slate-600 uppercase font-bold tracking-wider">Match</div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-emerald-300">{person.confidence}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="relative mb-2 sm:mb-3">
                  <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-lg" />
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                    <ScanFace size={18} className="text-slate-600 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold">{isCameraOn ? 'Scanning…' : 'Awaiting feed'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== TAB 2: IoT Overview ========== */
function OverviewTab({ optimalCount, criticalCount, machines, selectedMachine, setSelectedMachine, fetchTelemetryAndRisk, telemetry }) {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={<CheckCircle2 size={16} className="sm:w-5 sm:h-5" />} label="Optimal" value={optimalCount} color="emerald" />
        <StatCard icon={<AlertOctagon size={16} className="sm:w-5 sm:h-5" />} label="Critical" value={criticalCount} color="rose" />
        <div className="col-span-2 lg:col-span-1">
          <StatCard icon={<Activity size={16} className="sm:w-5 sm:h-5" />}     label="Total Assets" value={machines.length} color="amber" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-1 rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
          <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-4 sm:p-5 max-h-[300px] lg:max-h-none overflow-y-auto scrollbar-hide">
            <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-white/[0.06] mb-3 sm:mb-4 sticky top-0 bg-[#0a0c14]/95 backdrop-blur z-10">
              <Radio size={12} className="text-amber-300 sm:w-3.5 sm:h-3.5" />
              <h3 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-[0.15em]">Active Machines</h3>
            </div>
            <div className="space-y-2">
              {machines.map((machine) => {
                const active = selectedMachine?._id === machine._id;
                const critical = machine.status === 'CRITICAL_RISK' || machine.status === 'OFFLINE';
                return (
                  <button
                    key={machine._id}
                    onClick={() => { setSelectedMachine(machine); fetchTelemetryAndRisk(machine._id); }}
                    className={`group w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all ${
                      active ? 'bg-white/[0.06] border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]' : 'bg-white/[0.015] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className={`font-semibold text-[11px] sm:text-xs truncate ${active ? 'text-amber-200' : 'text-white'}`}>{machine.code}</span>
                      <span className={`shrink-0 inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full border ${critical ? 'text-rose-300 bg-rose-500/10 border-rose-500/25' : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'}`}>
                        <span className={`w-1 h-1 rounded-full ${critical ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                        {critical ? 'CRITICAL' : 'OPTIMAL'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
          <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-3 sm:p-5">
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-white/[0.06] mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-amber-300 sm:w-3.5 sm:h-3.5" />
                <h3 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-[0.15em] truncate">Live Telemetry · {selectedMachine?.code || '—'}</h3>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                Live
              </span>
            </div>

            <div className="h-56 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2533" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#1e2533' }} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#fbbf24" tick={{ fontSize: 10, fill: '#fbbf24' }} axisLine={false} tickLine={false} width={35} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 10, fill: '#f43f5e' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10,12,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.8)', padding: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="vibration" stroke="#fbbf24" strokeWidth={2} name="Vibration" dot={{ fill: '#fbbf24', r: 2, strokeWidth: 0 }} activeDot={{ r: 4, stroke: '#0a0c14', strokeWidth: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2} name="Temp" dot={{ fill: '#f43f5e', r: 2, strokeWidth: 0 }} activeDot={{ r: 4, stroke: '#0a0c14', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const map = {
    emerald: { text: 'text-emerald-300', border: 'border-emerald-500/25', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]' },
    rose:    { text: 'text-rose-300',    border: 'border-rose-500/25',    bg: 'bg-rose-500/10',    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' },
    amber:   { text: 'text-amber-300',   border: 'border-amber-500/25',   bg: 'bg-amber-500/10',   glow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]' },
  };
  const c = map[color];

  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent hover:from-white/[0.15] transition-all h-full">
      <div className={`rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-3 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-4 h-full ${c.glow}`}>
        <div className={`shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold truncate">{label}</p>
          <h3 className={`text-xl sm:text-2xl font-bold ${c.text} mt-0.5 truncate`}>{value}</h3>
        </div>
      </div>
    </div>
  );
}

/* ========== TAB 3: ML Sandbox ========== */
function MLTab({ manualMetrics, setManualMetrics, injectManualData, riskProfile, isEmergencyActive, autoCutEnabled, setAutoCutEnabled, selectedMachine }) {
  const isDangerZone = manualMetrics.temperature > 85 || manualMetrics.vibration > 6.0;
  
  let cardClass = 'bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent';
  if (isEmergencyActive && autoCutEnabled) {
    cardClass = 'bg-red-500 animate-pulse'; 
  } else if (!autoCutEnabled && isDangerZone && riskProfile) {
    cardClass = 'bg-gradient-to-br from-rose-500/50 via-rose-500/10 to-transparent border-rose-500';
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Sandbox Card */}
      <div className={`rounded-2xl p-[1px] transition-all duration-300 ${cardClass}`}>
        <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-4 sm:p-6">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5 sm:mb-6 gap-4 pb-4 sm:pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center">
                <FlaskConical size={16} className="text-orange-300 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                  ML Sandbox {selectedMachine ? <span className="text-orange-400">· Target: {selectedMachine.code}</span> : ''}
                </h3>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-0.5 truncate">Adjust metrics to test predictive engine</p>
              </div>
            </div>

            <div className="flex w-full lg:w-auto items-center justify-between lg:justify-end gap-3 sm:gap-4">
              <label className="flex flex-1 sm:flex-none items-center justify-center gap-2 cursor-pointer bg-white/[0.03] px-3 py-2 sm:py-1.5 rounded-lg border border-white/[0.05]">
                <div className="relative shrink-0">
                  <input 
      type="checkbox" 
      className="sr-only" 
      checked={autoCutEnabled} 
      onChange={() => {
        const newVal = !autoCutEnabled;
        setAutoCutEnabled(newVal);
        // localStorage mein save kar rahe hain taaki GraphExplorer ko pata chale
        localStorage.setItem('ieg_autocut_active', newVal ? 'true' : 'false');
      }} 
    />
                  {/* <input type="checkbox" className="sr-only" checked={autoCutEnabled} onChange={() => setAutoCutEnabled(!autoCutEnabled)} /> */}
                  <div className={`block w-8 sm:w-9 h-4 sm:h-5 rounded-full transition-colors ${autoCutEnabled ? 'bg-rose-500' : 'bg-slate-700'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-transform ${autoCutEnabled ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <PowerOff size={10} className="hidden sm:block" /> Auto-Cut {autoCutEnabled ? 'ON' : 'OFF'}
                </span>
              </label>

              <button onClick={injectManualData} className="flex-1 sm:flex-none group relative overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-orange-400/60 via-rose-400/40 to-orange-500/60 transition-transform hover:scale-[1.015] active:scale-[0.99]">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#0a0c14] px-3 sm:px-5 py-2 sm:py-2 group-hover:bg-[#0f1119] transition-colors h-full">
                  <Zap size={12} className="text-orange-300 sm:w-[13px] sm:h-[13px]" />
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-white whitespace-nowrap">Inject & Predict</span>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <RangeSlider label="Temp" unit="°C" min={40} max={150} step={0.5} value={manualMetrics.temperature} warnThreshold={85} color="rose" onChange={v => setManualMetrics({ ...manualMetrics, temperature: v })} />
            <RangeSlider label="Vibration" unit="" min={0} max={15} step={0.1} value={manualMetrics.vibration} warnThreshold={6} color="amber" onChange={v => setManualMetrics({ ...manualMetrics, vibration: v })} />
            <RangeSlider label="Pressure" unit="PSI" min={50} max={200} step={1} value={manualMetrics.pressure} warnThreshold={160} color="cyan" onChange={v => setManualMetrics({ ...manualMetrics, pressure: v })} />
            <RangeSlider label="RPM" unit="" min={1000} max={5000} step={100} value={manualMetrics.rotationalSpeed} warnThreshold={4500} color="violet" onChange={v => setManualMetrics({ ...manualMetrics, rotationalSpeed: v })} />
          </div>
        </div>
      </div>

      {/* Results */}
      {riskProfile ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-amber-400/30 via-white/[0.03] to-transparent">
            <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-4 sm:p-5 h-full">
              <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-white/[0.06] mb-3 sm:mb-4">
                <BrainCircuit size={14} className="text-amber-300 sm:w-3.5 sm:h-3.5" />
                <h3 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-[0.15em]">Root Cause Analysis</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{riskProfile.primaryDriver}</p>
            </div>
          </div>

          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400/30 via-white/[0.03] to-transparent">
            <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-4 sm:p-5 h-full">
              <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-white/[0.06] mb-3 sm:mb-4">
                <History size={14} className="text-cyan-300 sm:w-3.5 sm:h-3.5" />
                <h3 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-[0.15em]">Pattern Matches</h3>
              </div>
              <div className="space-y-2">
                {riskProfile.matchedHistoricalIncidents?.map((incident, idx) => (
                  <div key={idx} className="bg-white/[0.02] p-2.5 sm:p-3 rounded-xl border border-white/[0.06] hover:border-cyan-400/25 transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="text-[11px] sm:text-xs font-bold text-white">{incident.incidentCode}</p>
                      {incident.similarity && (
                        <span className="text-[8px] sm:text-[9px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.5 rounded-full">
                          {(incident.similarity * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">{incident.preventiveAction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
          <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-8 sm:p-12 text-center">
            <div className="relative inline-block mb-3 sm:mb-4">
              <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-xl" />
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-emerald-300 sm:w-6 sm:h-6" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white mb-1">System Stable</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">No ML risk detected. All parameters nominal.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RangeSlider({ label, unit, min, max, step, value, warnThreshold, color, onChange }) {
  const isWarn = value > warnThreshold;
  const map = {
    rose:   { thumb: 'accent-rose-400',   text: isWarn ? 'text-rose-300'    : 'text-emerald-300' },
    amber:  { thumb: 'accent-amber-400',  text: isWarn ? 'text-amber-300'   : 'text-emerald-300' },
    cyan:   { thumb: 'accent-cyan-400',   text: isWarn ? 'text-cyan-300'    : 'text-emerald-300' },
    violet: { thumb: 'accent-violet-400', text: isWarn ? 'text-violet-300'  : 'text-emerald-300' },
  };
  const c = map[color];

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">{label}</span>
        <span className={`text-[11px] sm:text-xs font-bold ${c.text}`}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 sm:h-2 rounded-full appearance-none cursor-pointer bg-white/[0.06] ${c.thumb}`}
      />
      <div className="flex justify-between text-[8px] sm:text-[9px] text-slate-600 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* ========== TAB 4: Forensic ========== */
function ForensicTab({ videoFile, setVideoFile, handleForensicScan, isScanning, forensicResults, setSelectedImage }) {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
        <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 pb-4 sm:pb-5 border-b border-white/[0.06] mb-4 sm:mb-5">
            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
              <UserSearch size={16} className="text-cyan-300 sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">Post-Incident Forensic</h3>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-0.5 truncate">
                Upload footage · extract evidence
              </p>
            </div>
          </div>

          <label className="group relative block cursor-pointer rounded-xl border-2 border-dashed border-white/[0.08] hover:border-cyan-400/40 bg-white/[0.01] hover:bg-cyan-500/[0.02] transition-all p-6 sm:p-8 text-center mb-4">
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="hidden" />
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud size={18} className="text-cyan-300 sm:w-[22px] sm:h-[22px]" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white mb-1 px-4 truncate">
              {videoFile ? videoFile.name : 'Drop video file or click to browse'}
            </p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-500">
              {videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(2)} MB · ready` : 'MP4, MOV — max 500MB'}
            </p>
          </label>

          <button onClick={handleForensicScan} disabled={isScanning || !videoFile} className="group relative w-full overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-cyan-400/60 via-blue-400/40 to-cyan-500/60 transition-transform hover:scale-[1.015] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-[#0a0c14] px-5 sm:px-6 py-2.5 sm:py-3 group-hover:bg-[#0f1119] transition-colors">
              {isScanning ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-cyan-400/30 border-t-cyan-300 animate-spin" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white">Scanning…</span>
                </>
              ) : (
                <>
                  <Search size={12} className="text-cyan-300 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white">Start Forensic Scan</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {forensicResults && (
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent">
          <div className="rounded-[15px] bg-[#0a0c14]/85 backdrop-blur-xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/[0.06] mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <ScanFace size={12} className="text-cyan-300 sm:w-3.5 sm:h-3.5" />
                <h4 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-[0.15em]">Individuals Identified</h4>
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-full">
                {forensicResults.length} matches
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {forensicResults.map((person, index) => (
                <div key={index} className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-cyan-400/40 bg-white/[0.02] transition-all cursor-pointer" onClick={() => setSelectedImage(person.photo)}>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={person.photo} alt={person.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500/20 backdrop-blur-sm">
                      <Maximize2 size={16} className="text-white sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5">
                    <p className="text-[10px] sm:text-[11px] font-bold text-white truncate">{person.name}</p>
                    {person.confidence && (
                      <p className="text-[8px] sm:text-[9px] text-cyan-300 font-bold mt-0.5">{person.confidence}% match</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}