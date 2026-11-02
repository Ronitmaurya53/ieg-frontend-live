
// import { useState, useEffect, useCallback, useRef } from 'react';
// import ReactFlow, { 
//   Background, Controls, MiniMap, 
//   useNodesState, useEdgesState, addEdge, ConnectionMode,
//   Handle, Position 
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import { apiClient } from '../api/client';
// import { Activity, Plus, Server, RefreshCw, Power, X, Zap, Trash2, Edit2, Link } from 'lucide-react';

// // ==========================================
// // 🔊 EMERGENCY ALARM SOUND (Browser Native)
// // ==========================================
// const playEmergencyAlarm = () => {
//   try {
//     const ctx = new (window.AudioContext || window.webkitAudioContext)();
//     const osc = ctx.createOscillator();
//     const gainNode = ctx.createGain();
    
//     osc.type = 'sawtooth';
//     osc.frequency.setValueAtTime(1200, ctx.currentTime);
//     osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5); 
    
//     gainNode.gain.setValueAtTime(0.2, ctx.currentTime); 
    
//     osc.connect(gainNode);
//     gainNode.connect(ctx.destination);
    
//     osc.start();
//     osc.stop(ctx.currentTime + 0.5);
//   } catch (error) {}
// };

// // ==========================================
// // 🎨 CLEAN CUSTOM NODE (UPDATED FOR AUTO-CUT)
// // ==========================================
// const CustomDeviceNode = ({ data, id }) => {
//   const isCritical = data.status === 'CRITICAL_RISK' || data.status === 'OFFLINE';
//   const isSystemCut = data.status === 'SYSTEM_CUT'; // 🚀 NAYA: Auto-cut status

//   let bgColor = 'bg-slate-900';
//   let borderColor = 'border-green-500';
//   let handleColor = 'bg-blue-400';

//   if (isSystemCut) {
//     // AUTO-CUT ON: System safe but disconnected
//     bgColor = 'bg-slate-800/80';
//     borderColor = 'border-slate-500 border-dashed';
//     handleColor = 'bg-transparent'; // Hide handles
//   } else if (isCritical) {
//     // AUTO-CUT OFF: Danger state
//     bgColor = 'bg-[#450a0a] animate-pulse';
//     borderColor = 'border-red-500 shadow-[0_0_15px_red]';
//     handleColor = 'bg-red-500 shadow-[0_0_10px_red]';
//   }

//   return (
//     <div className={`relative group flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 ${bgColor} ${borderColor} text-white font-semibold text-[11px] sm:text-[13px] w-[180px] sm:w-[220px] shadow-lg transition-all duration-300`}>
//       <Handle type="target" position={Position.Top} className={`w-2 h-2 ${handleColor} border-none rounded-full transition-colors`} />
//       <Handle type="source" position={Position.Bottom} className={`w-2 h-2 ${handleColor} border-none rounded-full transition-colors`} />
      
//       <span className="truncate pr-2" title={data.label}>{data.label}</span>
      
//       <div className="flex gap-1 sm:gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
//         <button onClick={(e) => { e.stopPropagation(); data.onEdit(id, data.label); }} className="text-blue-400 hover:text-blue-500 bg-slate-950 rounded p-1 sm:p-1.5" title="Edit Node"><Edit2 size={12} className="sm:w-3.5 sm:h-3.5" /></button>
//         <button onClick={(e) => { e.stopPropagation(); data.onDelete(id); }} className="text-red-400 hover:text-red-500 bg-slate-950 rounded p-1 sm:p-1.5" title="Delete Node"><Trash2 size={12} className="sm:w-3.5 sm:h-3.5" /></button>
//       </div>
//     </div>
//   );
// };

// const nodeTypes = { customDevice: CustomDeviceNode };

// export default function GraphExplorer() {
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [loading, setLoading] = useState(true);
  
//   const [isAddingModal, setIsAddingModal] = useState(false);
//   const [simulatorMode, setSimulatorMode] = useState(false);
//   const [autoSync, setAutoSync] = useState(true);
  
//   const [edgeModal, setEdgeModal] = useState({ open: false, params: null, label: 'Backup Link' });
//   const [newMachine, setNewMachine] = useState({ name: '', code: '', facilityName: 'Gorakhpur Main Plant' });
//   const [submitting, setSubmitting] = useState(false);

//   const [editModal, setEditModal] = useState({ open: false, nodeId: null, name: '' });
//   const [edgeEditModal, setEdgeEditModal] = useState({ open: false, edgeId: null, label: '' });

//   const previousNodesRef = useRef([]);

//   const onConnect = useCallback((params) => {
//     setEdgeModal({ open: true, params, label: 'Custom Data Link' });
//   }, []);

//   const handleSaveEdge = (e) => {
//     e.preventDefault();
//     const newCustomEdge = {
//       ...edgeModal.params,
//       id: `custom-edge-${Date.now()}`,
//       label: edgeModal.label,
//       animated: true,
//       style: { stroke: '#3b82f6', strokeWidth: 2.5 }
//     };
    
//     setEdges((eds) => {
//       const updatedEdges = addEdge(newCustomEdge, eds);
//       localStorage.setItem('ieg_custom_edges', JSON.stringify(updatedEdges.filter(ed => ed.id.startsWith('custom-edge-'))));
//       return updatedEdges;
//     });
//     setEdgeModal({ open: false, params: null, label: '' });
//   };

//   const onEdgeClick = (event, edge) => {
//     event.stopPropagation();
//     setEdgeEditModal({ open: true, edgeId: edge.id, label: edge.label || '' });
//   };

//   const handleEdgeRenameSubmit = (e) => {
//     e.preventDefault();
//     setEdges((eds) => {
//       const updated = eds.map(ed => ed.id === edgeEditModal.edgeId ? { ...ed, label: edgeEditModal.label } : ed);
//       localStorage.setItem('ieg_custom_edges', JSON.stringify(updated.filter(ed => ed.id.startsWith('custom-edge-'))));
//       return updated;
//     });
//     setEdgeEditModal({ open: false, edgeId: null, label: '' });
//   };

//   const handleEdgeDelete = () => {
//     if (!window.confirm("Are you sure you want to delete this connection?")) return;
//     setEdges((eds) => {
//       const updated = eds.filter(ed => ed.id !== edgeEditModal.edgeId);
//       localStorage.setItem('ieg_custom_edges', JSON.stringify(updated.filter(ed => ed.id.startsWith('custom-edge-'))));
//       return updated;
//     });
//     setEdgeEditModal({ open: false, edgeId: null, label: '' });
//   };

//   const handleDeleteNode = async (nodeId) => {
//     if (!window.confirm("Are you sure you want to delete this node?")) return;
    
//     setNodes((nds) => nds.filter((n) => n.id !== nodeId));
//     setEdges((eds) => {
//       const filtered = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
//       localStorage.setItem('ieg_custom_edges', JSON.stringify(filtered.filter(ed => ed.id.startsWith('custom-edge-'))));
//       return filtered;
//     });
    
//     if (nodeId.startsWith('inc-')) return; 

//     try {
//       if (nodeId.startsWith('mach-')) {
//         await apiClient.delete(`/machines/${nodeId.replace('mach-', '')}`);
//       } else if (nodeId.startsWith('fac-')) {
//         await apiClient.delete(`/facilities/${nodeId.replace('fac-', '')}`);
//       }
//     } catch (err) {}
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editModal.nodeId.startsWith('inc-')) {
//         setNodes((nds) => nds.map(n => n.id === editModal.nodeId ? { ...n, data: { ...n.data, label: editModal.name } } : n));
//         setEditModal({ open: false, nodeId: null, name: '' });
//         return;
//       }

//       const actualId = editModal.nodeId.replace('mach-', '').replace('fac-', '');
//       const isMachine = editModal.nodeId.startsWith('mach-');
//       await apiClient.put(isMachine ? `/machines/${actualId}` : `/facilities/${actualId}`, { name: editModal.name });
      
//       setNodes((nds) => nds.map(n => n.id === editModal.nodeId ? { ...n, data: { ...n.data, label: editModal.name } } : n));
//       setEditModal({ open: false, nodeId: null, name: '' });
//     } catch (err) {
//       alert("Failed to update.");
//     }
//   };

//   const fetchGraphData = async () => {
//     if (!autoSync) return;
//     try {
//       const res = await apiClient.get('/graph/explore');
//       const apiData = res.data.data;

//       if (apiData && apiData.nodes && apiData.edges) {
//         let alarmTriggered = false;

//         setNodes((currentNodes) => {
//           const nextNodes = [];
//           apiData.nodes.forEach(apiNode => {
//             const existingNode = currentNodes.find(n => n.id === apiNode.id);
//             if (existingNode && existingNode.data.status !== 'OFFLINE' && apiNode.status === 'OFFLINE') alarmTriggered = true;

//             if (existingNode) {
//               nextNodes.push({ ...existingNode, data: { ...existingNode.data, label: apiNode.data ? apiNode.data.label : apiNode.label, status: apiNode.status }});
//             } else {
//               nextNodes.push({
//                 id: apiNode.id, type: 'customDevice', position: apiNode.position || { x: 100, y: 100 },
//                 data: { label: apiNode.data ? apiNode.data.label : apiNode.label, status: apiNode.status, onDelete: handleDeleteNode, onEdit: (id, name) => setEditModal({ open: true, nodeId: id, name }) }
//               });
//             }
//           });
//           previousNodesRef.current = nextNodes;
//           return nextNodes;
//         });

//         if (alarmTriggered) playEmergencyAlarm();

//         setEdges(() => {
//           const savedCustomEdges = JSON.parse(localStorage.getItem('ieg_custom_edges') || '[]');
//           const allEdges = [...apiData.edges, ...savedCustomEdges];
          
//           return allEdges.map(edge => {
//             const sNode = previousNodesRef.current.find(n => n.id === edge.source);
//             const tNode = previousNodesRef.current.find(n => n.id === edge.target);
            
//             // 🚀 NAYA: Edge hiding and coloring logic based on Machine Status
//             const isSystemCut = (sNode && sNode.data.status === 'SYSTEM_CUT') || 
//                                 (tNode && tNode.data.status === 'SYSTEM_CUT') || 
//                                 edge.status === 'SYSTEM_CUT';
            
//             const isCritical = (sNode && (sNode.data.status === 'CRITICAL_RISK' || sNode.data.status === 'OFFLINE')) || 
//                                (tNode && (tNode.data.status === 'CRITICAL_RISK' || tNode.data.status === 'OFFLINE')) || 
//                                edge.status === 'CRITICAL_RISK' || edge.status === 'OFFLINE';
            
//             return {
//               ...edge,
//               animated: true,
//               hidden: isSystemCut, // AUTO-CUT ON: Hide the line completely
//               style: isCritical && !isSystemCut 
//                 ? { stroke: '#ef4444', strokeWidth: 3, filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.8))' } // AUTO-CUT OFF: Red glowing line
//                 : { stroke: '#3b82f6', strokeWidth: 2 } // NORMAL: Blue line
//             };
//           });
//         });
//       }
//     } catch (error) {} finally { setLoading(false); }
//   };

//   useEffect(() => {
//     fetchGraphData();
//     const interval = setInterval(fetchGraphData, 3000);
//     return () => clearInterval(interval);
//   }, [autoSync]);

//   const toggleDeviceStatus = (nodeId) => {
//     setAutoSync(false);
//     let turnedOffline = false;

//     setNodes((nds) => {
//       const updatedNodes = nds.map(n => {
//         if (n.id === nodeId) {
//           const isOff = n.data.status === 'OFFLINE';
//           if (!isOff) turnedOffline = true;
//           return { ...n, data: { ...n.data, status: isOff ? 'OPTIMAL' : 'OFFLINE' } };
//         }
//         return n;
//       });

//       if (turnedOffline) playEmergencyAlarm();

//       setEdges((eds) => eds.map(e => {
//         const sNode = updatedNodes.find(n => n.id === e.source);
//         const tNode = updatedNodes.find(n => n.id === e.target);
//         const isDanger = (sNode && sNode.data.status === 'OFFLINE') || (tNode && tNode.data.status === 'OFFLINE');
        
//         return { 
//           ...e, 
//           hidden: isDanger
//         };
//       }));

//       return updatedNodes;
//     });
//   };

//   const handleAddMachineSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       const facRes = await apiClient.post('/facilities', { name: newMachine.facilityName, code: `PLT-${Math.floor(Math.random()*1000)}`, location: "Gorakhpur, UP" });
//       await apiClient.post('/machines', { facilityId: facRes.data.data._id, code: newMachine.code.toUpperCase(), name: newMachine.name, type: "CENTRIFUGAL_PUMP" });
//       setIsAddingModal(false); setNewMachine({ name: '', code: '', facilityName: '' }); fetchGraphData(); 
//     } catch (err) { alert("Failed."); } finally { setSubmitting(false); }
//   };

//   if (loading && nodes.length === 0) return <div className="text-slate-400 flex h-[60vh] items-center justify-center">Loading Data...</div>;

//   return (
//     <div className="h-full flex flex-col space-y-4 relative">
//       <div className="bg-brand-card p-3 sm:p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg gap-3 sm:gap-0">
//         <div>
//           <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Activity className="text-brand-accent animate-pulse w-5 h-5 sm:w-6 sm:h-6" /> Network Topology</h2>
//           <p className="text-[11px] sm:text-sm text-slate-400 mt-1 sm:mt-0">{autoSync ? "Live multi-device real-time sync active." : <span className="text-yellow-400">Demo Simulator Active (Sync paused).</span>}</p>
//         </div>
//         <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
//           <button onClick={() => setSimulatorMode(!simulatorMode)} className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold border ${simulatorMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-slate-800 text-slate-300 border-slate-700'}`}><Power size={12} className="sm:w-3.5 sm:h-3.5" /> Sim</button>
//           <button onClick={() => { setAutoSync(true); fetchGraphData(); }} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold border border-slate-700"><RefreshCw size={12} className="sm:w-3.5 sm:h-3.5" /> Sync</button>
//           <button onClick={() => setIsAddingModal(true)} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 bg-brand-accent text-white px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold"><Plus size={14} className="sm:w-4 sm:h-4" /> Node</button>
//         </div>
//       </div>

//       <div className="w-full h-[60vh] sm:h-[75vh] bg-slate-950 border border-slate-700 rounded-xl overflow-hidden relative">
//         <ReactFlow 
//           nodes={nodes} 
//           edges={edges} 
//           onNodesChange={onNodesChange} 
//           onEdgesChange={onEdgesChange} 
//           onConnect={onConnect} 
//           onEdgeClick={onEdgeClick} 
//           nodeTypes={nodeTypes} 
//           connectionMode={ConnectionMode.Loose} 
//           fitView 
//           style={{ width: '100%', height: '100%' }}
//         >
//           <Background color="#1e293b" gap={24} size={1.5} />
//           <Controls className="bg-brand-card border-slate-700 fill-white" showInteractive={false} />
//           <MiniMap maskColor="rgba(15, 23, 42, 0.8)" className="bg-brand-card border-slate-700 hidden sm:block" />
//         </ReactFlow>

//         {simulatorMode && (
//           <div className="absolute top-4 sm:top-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-xl p-4 sm:p-5 shadow-2xl z-[100]">
//             <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-3">
//               <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base"><Power size={16} className="text-brand-accent sm:w-4 sm:h-4"/> Simulator</h3>
//               <button onClick={() => setSimulatorMode(false)} className="text-slate-400 hover:text-white p-1"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
//             </div>
//             <div className="space-y-2 max-h-[40vh] sm:max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
//               {nodes.map(node => (
//                 <div key={node.id} className="flex justify-between items-center bg-slate-950 p-2 sm:p-2.5 rounded-lg border border-slate-800">
//                   <span className="text-[11px] sm:text-xs font-medium text-slate-300 truncate w-24 sm:w-32">{node.data.label}</span>
//                   <button onClick={() => toggleDeviceStatus(node.id)} className={`px-2 sm:px-3 py-1 rounded text-[9px] sm:text-[10px] font-bold uppercase ${node.data.status === 'OFFLINE' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-green-500/20 text-green-500 border border-green-500/50'}`}>
//                     {node.data.status === 'OFFLINE' ? 'Offline' : 'Online'}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* CREATE EDGE MODAL */}
//       {edgeModal.open && (
//         <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
//           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-[90vw] max-w-sm shadow-2xl">
//             <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2"><Zap className="text-brand-accent" size={18} /> Connect Devices</h3>
//             <form onSubmit={handleSaveEdge}>
//               <input type="text" value={edgeModal.label} onChange={(e) => setEdgeModal({...edgeModal, label: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none mb-4" autoFocus required />
//               <div className="flex gap-2 sm:gap-3">
//                 <button type="button" onClick={() => setEdgeModal({open: false, params: null, label: ''})} className="flex-1 bg-slate-800 text-slate-300 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Cancel</button>
//                 <button type="submit" className="flex-1 bg-brand-accent text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Create Link</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* EDIT/RENAME EDGE MODAL */}
//       {edgeEditModal.open && (
//         <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
//           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-[90vw] max-w-sm shadow-2xl">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><Link className="text-blue-400" size={18} /> Edit Connection</h3>
//               <button onClick={handleEdgeDelete} className="text-red-400 hover:text-red-500 bg-red-500/10 p-1.5 sm:p-2 rounded-lg transition-colors" title="Delete Edge">
//                 <Trash2 size={14} className="sm:w-4 sm:h-4" />
//               </button>
//             </div>
//             <form onSubmit={handleEdgeRenameSubmit}>
//               <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">Connection Label</label>
//               <input type="text" value={edgeEditModal.label} onChange={(e) => setEdgeEditModal({...edgeEditModal, label: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none mb-4 focus:border-blue-500" autoFocus placeholder="e.g. Data Flow" />
//               <div className="flex gap-2 sm:gap-3">
//                 <button type="button" onClick={() => setEdgeEditModal({open: false, edgeId: null, label: ''})} className="flex-1 bg-slate-800 text-slate-300 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Cancel</button>
//                 <button type="submit" className="flex-1 bg-blue-500 text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Save</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* EDIT NODE MODAL */}
//       {editModal.open && (
//         <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
//           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-[90vw] max-w-sm shadow-2xl">
//             <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2"><Edit2 className="text-blue-400" size={18} /> Rename Node</h3>
//             <form onSubmit={handleEditSubmit}>
//               <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">New Name</label>
//               <input type="text" value={editModal.name} onChange={(e) => setEditModal({...editModal, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none mb-4 focus:border-blue-500" autoFocus required />
//               <div className="flex gap-2 sm:gap-3">
//                 <button type="button" onClick={() => setEditModal({open: false, nodeId: null, name: ''})} className="flex-1 bg-slate-800 text-slate-300 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Cancel</button>
//                 <button type="submit" className="flex-1 bg-blue-500 text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Update</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ADD NODE MODAL */}
//       {isAddingModal && (
//         <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
//           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-[90vw] max-w-md shadow-2xl">
//             <h3 className="text-base sm:text-lg font-bold text-white mb-4"><Server className="text-brand-accent inline mr-2" size={18} /> Register New Device</h3>
//             <form onSubmit={handleAddMachineSubmit} className="space-y-3 sm:space-y-4">
//               <div>
//                 <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">Facility / Hub Name</label>
//                 <input type="text" placeholder="e.g. Motor Assembly" value={newMachine.facilityName} onChange={(e) => setNewMachine({...newMachine, facilityName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none focus:border-brand-accent" required />
//               </div>
//               <div>
//                 <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">Machine Name</label>
//                 <input type="text" placeholder="e.g. Main Motor B1" value={newMachine.name} onChange={(e) => setNewMachine({...newMachine, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none focus:border-brand-accent" required />
//               </div>
//               <div>
//                 <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">Machine Code / ID</label>
//                 <input type="text" placeholder="e.g. MOT-01" value={newMachine.code} onChange={(e) => setNewMachine({...newMachine, code: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none focus:border-brand-accent" required />
//               </div>
//               <div className="flex gap-2 sm:gap-3 pt-2">
//                 <button type="button" onClick={() => setIsAddingModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm">Cancel</button>
//                 <button type="submit" disabled={submitting} className="flex-1 bg-brand-accent text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm">Deploy</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
  Background, Controls, MiniMap, 
  useNodesState, useEdgesState, addEdge, ConnectionMode,
  Handle, Position 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { apiClient } from '../api/client';
import { Activity, Plus, Server, RefreshCw, Power, X, Zap, Trash2, Edit2, Link } from 'lucide-react';

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
  } catch (error) {}
};

const CustomDeviceNode = ({ data, id }) => {
  const isCritical = data.status === 'CRITICAL_RISK' || data.status === 'OFFLINE';
  const isAutoCutOn = localStorage.getItem('ieg_autocut_active') === 'true'; // 🚀 LocalStorage check

  let bgColor = 'bg-slate-900';
  let borderColor = 'border-green-500';
  let handleColor = 'bg-blue-400';

  if (isCritical && isAutoCutOn) {
    // AUTO-CUT ON: Disconnected state (Safe/Grey dashed)
    bgColor = 'bg-slate-800/80';
    borderColor = 'border-slate-500 border-dashed';
    handleColor = 'bg-transparent';
  } else if (isCritical) {
    // AUTO-CUT OFF: Danger red state
    bgColor = 'bg-[#450a0a] animate-pulse';
    borderColor = 'border-red-500 shadow-[0_0_15px_red]';
    handleColor = 'bg-red-500 shadow-[0_0_10px_red]';
  }

  return (
    <div className={`relative group flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 ${bgColor} ${borderColor} text-white font-semibold text-[11px] sm:text-[13px] w-[180px] sm:w-[220px] shadow-lg transition-all duration-300`}>
      <Handle type="target" position={Position.Top} className={`w-2 h-2 ${handleColor} border-none rounded-full transition-colors`} />
      <Handle type="source" position={Position.Bottom} className={`w-2 h-2 ${handleColor} border-none rounded-full transition-colors`} />
      
      <span className="truncate pr-2" title={data.label}>{data.label}</span>
      
      <div className="flex gap-1 sm:gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={(e) => { e.stopPropagation(); data.onEdit(id, data.label); }} className="text-blue-400 hover:text-blue-500 bg-slate-950 rounded p-1 sm:p-1.5" title="Edit Node"><Edit2 size={12} className="sm:w-3.5 sm:h-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); data.onDelete(id); }} className="text-red-400 hover:text-red-500 bg-slate-950 rounded p-1 sm:p-1.5" title="Delete Node"><Trash2 size={12} className="sm:w-3.5 sm:h-3.5" /></button>
      </div>
    </div>
  );
};

const nodeTypes = { customDevice: CustomDeviceNode };

export default function GraphExplorer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingModal, setIsAddingModal] = useState(false);
  const [simulatorMode, setSimulatorMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  
  const [edgeModal, setEdgeModal] = useState({ open: false, params: null, label: 'Backup Link' });
  const [newMachine, setNewMachine] = useState({ name: '', code: '', facilityName: 'Gorakhpur Main Plant' });
  const [submitting, setSubmitting] = useState(false);

  const [editModal, setEditModal] = useState({ open: false, nodeId: null, name: '' });
  const [edgeEditModal, setEdgeEditModal] = useState({ open: false, edgeId: null, label: '' });

  const previousNodesRef = useRef([]);

  const onConnect = useCallback((params) => {
    setEdgeModal({ open: true, params, label: 'Custom Data Link' });
  }, []);

  const handleSaveEdge = (e) => {
    e.preventDefault();
    const newCustomEdge = {
      ...edgeModal.params,
      id: `custom-edge-${Date.now()}`,
      label: edgeModal.label,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2.5 }
    };
    
    setEdges((eds) => {
      const updatedEdges = addEdge(newCustomEdge, eds);
      localStorage.setItem('ieg_custom_edges', JSON.stringify(updatedEdges.filter(ed => ed.id.startsWith('custom-edge-'))));
      return updatedEdges;
    });
    setEdgeModal({ open: false, params: null, label: '' });
  };

  const onEdgeClick = (event, edge) => {
    event.stopPropagation();
    setEdgeEditModal({ open: true, edgeId: edge.id, label: edge.label || '' });
  };

  const handleEdgeRenameSubmit = (e) => {
    e.preventDefault();
    setEdges((eds) => {
      const updated = eds.map(ed => ed.id === edgeEditModal.edgeId ? { ...ed, label: edgeEditModal.label } : ed);
      localStorage.setItem('ieg_custom_edges', JSON.stringify(updated.filter(ed => ed.id.startsWith('custom-edge-'))));
      return updated;
    });
    setEdgeEditModal({ open: false, edgeId: null, label: '' });
  };

  const handleEdgeDelete = () => {
    if (!window.confirm("Are you sure you want to delete this connection?")) return;
    setEdges((eds) => {
      const updated = eds.filter(ed => ed.id !== edgeEditModal.edgeId);
      localStorage.setItem('ieg_custom_edges', JSON.stringify(updated.filter(ed => ed.id.startsWith('custom-edge-'))));
      return updated;
    });
    setEdgeEditModal({ open: false, edgeId: null, label: '' });
  };

  const handleDeleteNode = async (nodeId) => {
    if (!window.confirm("Are you sure you want to delete this node?")) return;
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => {
      const filtered = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
      localStorage.setItem('ieg_custom_edges', JSON.stringify(filtered.filter(ed => ed.id.startsWith('custom-edge-'))));
      return filtered;
    });
    if (nodeId.startsWith('inc-')) return; 
    try {
      if (nodeId.startsWith('mach-')) {
        await apiClient.delete(`/machines/${nodeId.replace('mach-', '')}`);
      } else if (nodeId.startsWith('fac-')) {
        await apiClient.delete(`/facilities/${nodeId.replace('fac-', '')}`);
      }
    } catch (err) {}
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editModal.nodeId.startsWith('inc-')) {
        setNodes((nds) => nds.map(n => n.id === editModal.nodeId ? { ...n, data: { ...n.data, label: editModal.name } } : n));
        setEditModal({ open: false, nodeId: null, name: '' });
        return;
      }
      const actualId = editModal.nodeId.replace('mach-', '').replace('fac-', '');
      const isMachine = editModal.nodeId.startsWith('mach-');
      await apiClient.put(isMachine ? `/machines/${actualId}` : `/facilities/${actualId}`, { name: editModal.name });
      setNodes((nds) => nds.map(n => n.id === editModal.nodeId ? { ...n, data: { ...n.data, label: editModal.name } } : n));
      setEditModal({ open: false, nodeId: null, name: '' });
    } catch (err) {
      alert("Failed to update.");
    }
  };

  const fetchGraphData = async () => {
    if (!autoSync) return;
    try {
      const res = await apiClient.get('/graph/explore');
      const apiData = res.data.data;

      if (apiData && apiData.nodes && apiData.edges) {
        let alarmTriggered = false;

        setNodes((currentNodes) => {
          const nextNodes = [];
          apiData.nodes.forEach(apiNode => {
            const existingNode = currentNodes.find(n => n.id === apiNode.id);
            if (existingNode && existingNode.data.status !== 'OFFLINE' && apiNode.status === 'OFFLINE') alarmTriggered = true;

            if (existingNode) {
              nextNodes.push({ ...existingNode, data: { ...existingNode.data, label: apiNode.data ? apiNode.data.label : apiNode.label, status: apiNode.status }});
            } else {
              nextNodes.push({
                id: apiNode.id, type: 'customDevice', position: apiNode.position || { x: 100, y: 100 },
                data: { label: apiNode.data ? apiNode.data.label : apiNode.label, status: apiNode.status, onDelete: handleDeleteNode, onEdit: (id, name) => setEditModal({ open: true, nodeId: id, name }) }
              });
            }
          });
          previousNodesRef.current = nextNodes;
          return nextNodes;
        });

        if (alarmTriggered) playEmergencyAlarm();

        setEdges(() => {
          const savedCustomEdges = JSON.parse(localStorage.getItem('ieg_custom_edges') || '[]');
          const allEdges = [...apiData.edges, ...savedCustomEdges];
          const isAutoCutOn = localStorage.getItem('ieg_autocut_active') === 'true'; // 🚀 Read Auto-cut state

          return allEdges.map(edge => {
            const sNode = previousNodesRef.current.find(n => n.id === edge.source);
            const tNode = previousNodesRef.current.find(n => n.id === edge.target);
            
            const isCritical = (sNode && (sNode.data.status === 'CRITICAL_RISK' || sNode.data.status === 'OFFLINE')) || 
                               (tNode && (tNode.data.status === 'CRITICAL_RISK' || tNode.data.status === 'OFFLINE')) || 
                               edge.status === 'CRITICAL_RISK' || edge.status === 'OFFLINE';
            
            // 🚀 HIDE edges if Auto-Cut is ON and critical, otherwise show red if Auto-Cut is OFF
            const shouldHide = isCritical && isAutoCutOn;
            const shouldBeRed = isCritical && !isAutoCutOn;

            return {
              ...edge,
              animated: true,
              hidden: shouldHide, 
              style: shouldBeRed 
                ? { stroke: '#ef4444', strokeWidth: 3, filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.8))' } 
                : { stroke: '#3b82f6', strokeWidth: 2 } 
            };
          });
        });
      }
    } catch (error) {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchGraphData();
    const interval = setInterval(fetchGraphData, 3000);
    return () => clearInterval(interval);
  }, [autoSync]);

  const toggleDeviceStatus = (nodeId) => {
    setAutoSync(false);
    let turnedOffline = false;

    setNodes((nds) => {
      const updatedNodes = nds.map(n => {
        if (n.id === nodeId) {
          const isOff = n.data.status === 'OFFLINE';
          if (!isOff) turnedOffline = true;
          return { ...n, data: { ...n.data, status: isOff ? 'OPTIMAL' : 'OFFLINE' } };
        }
        return n;
      });

      if (turnedOffline) playEmergencyAlarm();

      setEdges((eds) => eds.map(e => {
        const sNode = updatedNodes.find(n => n.id === e.source);
        const tNode = updatedNodes.find(n => n.id === e.target);
        const isDanger = (sNode && sNode.data.status === 'OFFLINE') || (tNode && tNode.data.status === 'OFFLINE');
        
        return { ...e, hidden: isDanger };
      }));

      return updatedNodes;
    });
  };

  const handleAddMachineSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const facRes = await apiClient.post('/facilities', { name: newMachine.facilityName, code: `PLT-${Math.floor(Math.random()*1000)}`, location: "Gorakhpur, UP" });
      await apiClient.post('/machines', { facilityId: facRes.data.data._id, code: newMachine.code.toUpperCase(), name: newMachine.name, type: "CENTRIFUGAL_PUMP" });
      setIsAddingModal(false); setNewMachine({ name: '', code: '', facilityName: '' }); fetchGraphData(); 
    } catch (err) { alert("Failed."); } finally { setSubmitting(false); }
  };

  if (loading && nodes.length === 0) return <div className="text-slate-400 flex h-[60vh] items-center justify-center">Loading Data...</div>;

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      <div className="bg-brand-card p-3 sm:p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg gap-3 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Activity className="text-brand-accent animate-pulse w-5 h-5 sm:w-6 sm:h-6" /> Network Topology</h2>
          <p className="text-[11px] sm:text-sm text-slate-400 mt-1 sm:mt-0">{autoSync ? "Live multi-device real-time sync active." : <span className="text-yellow-400">Demo Simulator Active (Sync paused).</span>}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={() => setSimulatorMode(!simulatorMode)} className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold border ${simulatorMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-slate-800 text-slate-300 border-slate-700'}`}><Power size={12} className="sm:w-3.5 sm:h-3.5" /> Sim</button>
          <button onClick={() => { setAutoSync(true); fetchGraphData(); }} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold border border-slate-700"><RefreshCw size={12} className="sm:w-3.5 sm:h-3.5" /> Sync</button>
          <button onClick={() => setIsAddingModal(true)} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 bg-brand-accent text-white px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold"><Plus size={14} className="sm:w-4 sm:h-4" /> Node</button>
        </div>
      </div>

      <div className="w-full h-[60vh] sm:h-[75vh] bg-slate-950 border border-slate-700 rounded-xl overflow-hidden relative">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect} 
          onEdgeClick={onEdgeClick} 
          nodeTypes={nodeTypes} 
          connectionMode={ConnectionMode.Loose} 
          fitView 
          style={{ width: '100%', height: '100%' }}
        >
          <Background color="#1e293b" gap={24} size={1.5} />
          <Controls className="bg-brand-card border-slate-700 fill-white" showInteractive={false} />
          <MiniMap maskColor="rgba(15, 23, 42, 0.8)" className="bg-brand-card border-slate-700 hidden sm:block" />
        </ReactFlow>

        {simulatorMode && (
          <div className="absolute top-4 sm:top-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-xl p-4 sm:p-5 shadow-2xl z-[100]">
            <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-3">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base"><Power size={16} className="text-brand-accent sm:w-4 sm:h-4"/> Simulator</h3>
              <button onClick={() => setSimulatorMode(false)} className="text-slate-400 hover:text-white p-1"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
            </div>
            <div className="space-y-2 max-h-[40vh] sm:max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
              {nodes.map(node => (
                <div key={node.id} className="flex justify-between items-center bg-slate-950 p-2 sm:p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] sm:text-xs font-medium text-slate-300 truncate w-24 sm:w-32">{node.data.label}</span>
                  <button onClick={() => toggleDeviceStatus(node.id)} className={`px-2 sm:px-3 py-1 rounded text-[9px] sm:text-[10px] font-bold uppercase ${node.data.status === 'OFFLINE' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-green-500/20 text-green-500 border border-green-500/50'}`}>
                    {node.data.status === 'OFFLINE' ? 'Offline' : 'Online'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CREATE EDGE MODAL */}
      {edgeModal.open && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-[90vw] max-w-sm shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2"><Zap className="text-brand-accent" size={18} /> Connect Devices</h3>
            <form onSubmit={handleSaveEdge}>
              <input type="text" value={edgeModal.label} onChange={(e) => setEdgeModal({...edgeModal, label: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none mb-4" autoFocus required />
              <div className="flex gap-2 sm:gap-3">
                <button type="button" onClick={() => setEdgeModal({open: false, params: null, label: ''})} className="flex-1 bg-slate-800 text-slate-300 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-accent text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Create Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT/RENAME EDGE MODAL */}
      {edgeEditModal.open && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-[90vw] max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><Link className="text-blue-400" size={18} /> Edit Connection</h3>
              <button onClick={handleEdgeDelete} className="text-red-400 hover:text-red-500 bg-red-500/10 p-1.5 sm:p-2 rounded-lg transition-colors" title="Delete Edge">
                <Trash2 size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
            <form onSubmit={handleEdgeRenameSubmit}>
              <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">Connection Label</label>
              <input type="text" value={edgeEditModal.label} onChange={(e) => setEdgeEditModal({...edgeEditModal, label: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none mb-4 focus:border-blue-500" autoFocus placeholder="e.g. Data Flow" />
              <div className="flex gap-2 sm:gap-3">
                <button type="button" onClick={() => setEdgeEditModal({open: false, edgeId: null, label: ''})} className="flex-1 bg-slate-800 text-slate-300 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT NODE MODAL */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-[90vw] max-w-sm shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2"><Edit2 className="text-blue-400" size={18} /> Rename Node</h3>
            <form onSubmit={handleEditSubmit}>
              <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">New Name</label>
              <input type="text" value={editModal.name} onChange={(e) => setEditModal({...editModal, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none mb-4 focus:border-blue-500" autoFocus required />
              <div className="flex gap-2 sm:gap-3">
                <button type="button" onClick={() => setEditModal({open: false, nodeId: null, name: ''})} className="flex-1 bg-slate-800 text-slate-300 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NODE MODAL */}
      {isAddingModal && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 w-[90vw] max-w-md shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4"><Server className="text-brand-accent inline mr-2" size={18} /> Register New Device</h3>
            <form onSubmit={handleAddMachineSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">Facility / Hub Name</label>
                <input type="text" placeholder="e.g. Motor Assembly" value={newMachine.facilityName} onChange={(e) => setNewMachine({...newMachine, facilityName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none focus:border-brand-accent" required />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">Machine Name</label>
                <input type="text" placeholder="e.g. Main Motor B1" value={newMachine.name} onChange={(e) => setNewMachine({...newMachine, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none focus:border-brand-accent" required />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mb-1 block">Machine Code / ID</label>
                <input type="text" placeholder="e.g. MOT-01" value={newMachine.code} onChange={(e) => setNewMachine({...newMachine, code: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 sm:p-3 text-white text-xs sm:text-sm outline-none focus:border-brand-accent" required />
              </div>
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button type="button" onClick={() => setIsAddingModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-brand-accent text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm">Deploy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}