import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, XCircle, RefreshCcw } from 'lucide-react';

export default function LiveSurveillance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [processedFrame, setProcessedFrame] = useState(null);
  const [facingMode, setFacingMode] = useState("user"); 
  
  // 🚀 NAYA: Isse hum track karenge ki loop chalna chahiye ya nahi
  const isRunning = useRef(false);

  const startCamera = async (currentMode = facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: currentMode, width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
      
      // 🚀 NAYA: Camera on hote hi Smart Loop chalu kar do
      isRunning.current = true;
      processFrameLoop(); 
    } catch (err) {
      alert("Error: Camera ka access nahi mila!");
    }
  };

  const stopCamera = () => {
    isRunning.current = false; // 🚀 NAYA: Loop rok do
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
    setProcessedFrame(null);
  };

  const toggleCamera = () => {
    stopCamera();
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    setTimeout(() => startCamera(newMode), 300);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // 🚀 NAYA: Smart Loop jo backend ka wait karta hai
  const processFrameLoop = async () => {
    if (!isRunning.current) return; // Agar camera band hai toh ruk jao

    await captureAndAnalyze(); // 1. Photo bhejo aur wapas aane ka wait karo

    // 2. Photo wapas aane ke 0.5 sec (500ms) baad hi agli photo bhejo (PC ko saans lene ka time do)
    if (isRunning.current) {
      setTimeout(processFrameLoop, 50); 
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.5); // Quality thodi aur kam ki (0.5) speed badhane ke liye

    try {
      const formData = new FormData();
      formData.append('image_base64', base64Image);
      
      // Local testing URL (Live ke liye ise onrender wale se replace kar dena)
      const res = await axios.post('https://ieg-ml-live.onrender.com/analyze-frame', formData);
      
      if (res.data.success && res.data.processed_image) {
        setProcessedFrame(res.data.processed_image);
      }
    } catch (error) {
      console.error("ML Error:", error);
    }
  };

  return (
    <div className="p-5 bg-slate-900 rounded-xl border border-slate-700 shadow-xl max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {isCameraOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isCameraOpen ? 'bg-red-500' : 'bg-slate-500'}`}></span>
          </span>
          AI Surveillance Engine
        </h3>
        
        <div className="flex gap-2">
          {isCameraOpen && (
            <button onClick={toggleCamera} className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm bg-slate-700 text-white hover:bg-slate-600 transition-all">
              <RefreshCcw size={16}/>
            </button>
          )}
          <button onClick={isCameraOpen ? stopCamera : startCamera} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-white transition-all ${isCameraOpen ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-blue-600 hover:bg-blue-500'}`}>
            {isCameraOpen ? <><XCircle size={16}/> Stop CCTV</> : <><Camera size={16}/> Start System</>}
          </button>
        </div>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden border border-slate-700 aspect-video flex items-center justify-center">
        {!isCameraOpen && <div className="text-slate-500 font-medium">Camera Offline</div>}
        
        <video ref={videoRef} autoPlay playsInline muted className="hidden" width="640" height="480" />
        <canvas ref={canvasRef} width="640" height="480" className="hidden" />

        {(processedFrame || isCameraOpen) && (
           <img src={processedFrame || "https://via.placeholder.com/640x480/000000/3b82f6?text=Initializing+AI+Vision..."} className="w-full h-full object-cover" alt="AI Feed" />
        )}
      </div>
    </div>
  );
}