import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Clock, Loader2, AlertCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { apiClient } from '../api/client';

export default function Incidents() {
  const [filter, setFilter] = useState('ALL');
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await apiClient.get('/alerts');
        setIncidents(res.data.data || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load active incidents.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const filtered = filter === 'ALL' 
    ? incidents 
    : incidents.filter(i => (i.status || '').toUpperCase() === filter);

  // 📄 PROFESSIONAL PDF REPORT GENERATOR
  const downloadPDFReport = () => {
    const doc = new jsPDF();

    // Header styling
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("IEG COMMAND CENTER", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Shift Incident Forensic Report • Generated: ${new Date().toLocaleString()}`, 14, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`Total Recorded Incidents: ${incidents.length}`, 14, 42);

    let yPos = 55;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ID", 14, yPos);
    doc.text("Description", 45, yPos);
    doc.text("Machine", 130, yPos);
    doc.text("Severity", 175, yPos);
    
    yPos += 8;
    doc.setFont("helvetica", "normal");
    
    incidents.forEach((inc, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const incId = inc.id || inc._id?.substring(0,8).toUpperCase() || 'INC-000';
      const title = inc.title || inc.description || 'Unknown Alert';
      const machine = inc.machine || 'General System';
      const severity = (inc.severity || 'LOW').toUpperCase();

      doc.text(incId, 14, yPos);
      doc.text(title.substring(0, 40), 45, yPos);
      doc.text(machine.substring(0, 15), 130, yPos);
      doc.text(severity, 175, yPos);
      
      yPos += 10;
    });

    doc.save(`IEG_Incident_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Incident Response
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Filter Tabs */}
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {['ALL', 'OPEN', 'RESOLVED'].map(f => (
              <button 
                key={f} onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 📄 PDF Download Button */}
          <button 
            onClick={downloadPDFReport}
            className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] whitespace-nowrap"
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={18} />
          <p className="text-xs sm:text-sm text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4 text-red-500" size={40} />
          <p className="text-sm">Scanning for security and operational anomalies...</p>
        </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Horizontal Scroll wrapper added here */}
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <table className="w-full text-left text-sm text-slate-400 min-w-[800px]">
              <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-xs">
                <tr>
                  <th className="px-4 sm:px-6 py-4">Incident ID</th>
                  <th className="px-4 sm:px-6 py-4">Description</th>
                  <th className="px-4 sm:px-6 py-4">Severity</th>
                  <th className="px-4 sm:px-6 py-4">Status</th>
                  <th className="px-4 sm:px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((inc) => (
                  <tr key={inc._id || inc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-mono text-white whitespace-nowrap">
                      {inc.id || inc._id?.substring(0,8).toUpperCase()}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-bold text-white mb-1 leading-tight line-clamp-2">{inc.title || inc.description || 'Unknown Alert'}</p>
                      {/* Fixed Typo Here */}
                      <div className="text-[11px] sm:text-xs flex items-center gap-1.5 text-slate-500 mt-1">
                        <Clock size={12} className="shrink-0" /> 
                        <span className="whitespace-nowrap">{new Date(inc.createdAt || inc.time || Date.now()).toLocaleString()}</span>
                        <span className="text-slate-700">•</span>
                        <span className="whitespace-nowrap">{inc.machine || 'General System'}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-bold ${
                        (inc.severity || '').toUpperCase() === 'CRITICAL' ? 'text-red-400' : 
                        (inc.severity || '').toUpperCase() === 'HIGH' ? 'text-orange-400' : 'text-blue-400'
                      }`}>
                        <ShieldAlert size={14}/> {inc.severity || 'LOW'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                        (inc.status || '').toUpperCase() === 'OPEN' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        (inc.status || '').toUpperCase() === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {inc.status || 'OPEN'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <button className="text-[11px] sm:text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all">
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                      No incidents found matching this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}