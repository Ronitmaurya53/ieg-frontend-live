import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Activity } from 'lucide-react';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    
    if (isLoginMode) {
      success = await login(email, password);
    } else {
      success = await register(name, email, password);
    }

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4 sm:p-6 selection:bg-brand-accent/30">
      <div className="bg-brand-card p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700 transition-all duration-300">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Activity className="text-brand-accent mb-2 sm:mb-3" size={36} />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider">IEG System</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 text-center">
            {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-xs sm:text-sm text-center mb-4 sm:mb-5 border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {!isLoginMode && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-1.5">Full Name</label>
              <input
                type="text"
                required={!isLoginMode}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-1.5">Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
              placeholder="operator@plant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-1.5">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-accent hover:bg-blue-600 text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 mt-2 sm:mt-4 active:scale-[0.98]"
          >
            {isLoading ? 'Processing...' : (isLoginMode ? 'Secure Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-5 sm:mt-6 text-center">
          <button 
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-xs sm:text-sm text-brand-accent hover:text-blue-400 transition-colors"
          >
            {isLoginMode 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}