
import React, { useState } from 'react';
import { auth } from '../firebase';
import { SystemMode } from '../types';

interface LoginScreenProps {
  setSystemMode: (mode: SystemMode) => void;
  onPasswordRecovery: (email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ setSystemMode, onPasswordRecovery }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<SystemMode>(SystemMode.RESTAURANT);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Use compat auth instance methods
      if (isSignUp) {
        await auth.createUserWithEmailAndPassword(email, password);
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }
      setSystemMode(selectedMode);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("User already exists. Please sign in");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Email or password is incorrect");
      } else {
        setError(err.message || "An authentication error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerReset = () => {
    if (!email) {
      setError("Please enter your email first to recover password.");
      return;
    }
    onPasswordRecovery(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6 text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex overflow-hidden">
        {/* Left: Branding & Mode Selection */}
        <div className="w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between">
           <div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-4xl font-black mb-4">Clear Book <span className="text-blue-200">POS</span></h1>
              <p className="text-blue-100 font-medium mb-12">Universal operating system for modern business.</p>
              
              <div className="space-y-4">
                 <label className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white">Select Terminal Mode</label>
                 <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => setSelectedMode(SystemMode.SUPERMARKET)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                        selectedMode === SystemMode.SUPERMARKET 
                          ? 'bg-white text-blue-600 border-white shadow-lg' 
                          : 'border-blue-500 hover:bg-blue-500/50'
                      }`}
                    >
                       <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                         </svg>
                       </div>
                       <div className="text-left">
                          <div className="font-black leading-none">SUPERMARKET</div>
                          <div className="text-[10px] opacity-80 mt-1 uppercase font-bold">Fast-scan retail mode</div>
                       </div>
                    </button>

                    <button 
                      onClick={() => setSelectedMode(SystemMode.RESTAURANT)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                        selectedMode === SystemMode.RESTAURANT 
                          ? 'bg-white text-blue-600 border-white shadow-lg' 
                          : 'border-blue-500 hover:bg-blue-500/50'
                      }`}
                    >
                       <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                         </svg>
                       </div>
                       <div className="text-left">
                          <div className="font-black leading-none">RESTAURANT</div>
                          <div className="text-[10px] opacity-80 mt-1 uppercase font-bold">Hospitality & Server mode</div>
                       </div>
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="text-[10px] font-black opacity-40 uppercase tracking-widest text-white">Version 2.6.0-Auth</div>
        </div>

        {/* Right: Auth Form */}
        <div className="flex-1 p-12 bg-white flex flex-col justify-center text-gray-900">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {isSignUp ? 'Create Account' : 'Staff Secure Access'}
            </h2>
            <p className="text-gray-400 font-bold text-sm">
              {isSignUp ? 'Register a new manager account' : 'Enter your credentials to continue'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 max-w-[360px] mx-auto w-full">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Email Address</label>
              <input 
                type="email"
                required
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-500 transition-colors text-gray-900"
                placeholder="email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Password</label>
                 {!isSignUp && (
                   <button type="button" onClick={triggerReset} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot Password?</button>
                 )}
               </div>
              <input 
                type="password"
                required
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold outline-none focus:border-blue-500 transition-colors text-gray-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl text-xl font-black text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isSignUp ? 'SIGN UP NOW' : 'AUTHORIZE ACCESS'}
            </button>
          </form>

          <div className="mt-8 text-center flex flex-col gap-2">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
