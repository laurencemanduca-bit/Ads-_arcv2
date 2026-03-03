
import React, { useState } from 'react';
import { loginEmail, signupEmail, signInWithGoogle, resetPasswordEmail } from '../services/firebase';
import { Loader2, Mail, Lock, ArrowRight, Layout, AlertCircle, CheckCircle, Send, KeyRound } from 'lucide-react';

interface AuthProps {
  view: 'login' | 'signup';
  onSwitchView: (view: 'login' | 'signup') => void;
  onSuccess: () => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ view, onSwitchView, onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Internal States
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (view === 'login') {
        await loginEmail(email, password);
        onSuccess();
      } else {
        await signupEmail(email, password);
        setNeedsVerification(true);
      }
    } catch (err: any) {
        // Handle Email Verification specifically (don't log as error)
        if (view === 'login' && (err.code === "auth/email-not-verified" || err.message === "Email not verified")) {
             setNeedsVerification(true);
             return; 
        }

        // Specific handling for Invalid Credentials (wrong password/user not found)
        if (
            err.code === 'auth/invalid-credential' || 
            err.code === 'auth/user-not-found' || 
            err.code === 'auth/wrong-password' ||
            (err.message && err.message.includes('invalid-credential'))
        ) {
            console.debug("Login failed: Invalid credentials");
            setError("Incorrect email or password. Please check your details.");
        } else {
            // Log actual system errors
            console.error("Auth System Error:", err);
            
            if (view === 'signup' && err.code === 'auth/email-already-in-use') {
                setError("User already exists. Please sign in.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else if (err.code === 'auth/invalid-email') {
                setError("Please enter a valid email address.");
            } else {
                setError(err.message || "Authentication failed. Please try again.");
            }
        }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          setError("Please enter your email address first.");
          return;
      }
      setError('');
      setSuccessMsg('');
      setLoading(true);
      try {
          await resetPasswordEmail(email);
          setSuccessMsg("Password reset link sent! Check your inbox.");
      } catch (err: any) {
          console.error("Reset Password Error:", err);
          if (err.code === 'auth/user-not-found') {
              setError("No account found with this email.");
          } else {
              setError("Failed to send reset email. Please try again.");
          }
      } finally {
          setLoading(false);
      }
  };

  const handleGoogle = async () => {
      setError('');
      try {
          await signInWithGoogle();
          onSuccess();
      } catch (err: any) {
          if (err.code === 'auth/popup-closed-by-user') {
              return; // Ignore if user just closed the popup
          }
          console.error("Google Auth Error:", err);
          setError(err.message || "Google Sign In Failed");
      }
  }

  const handleVerificationReset = () => {
      setNeedsVerification(false);
      onSwitchView('login');
      // Keep email populated but clear password
      setPassword('');
  };

  // 1. Email Verification View
  if (needsVerification) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
             <div onClick={onBack} className="cursor-pointer flex items-center gap-2 mb-8 text-slate-500 hover:text-slate-900 transition">
                <Layout className="w-5 h-5" />
                <span className="font-bold uppercase tracking-widest text-xs">Return Home</span>
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md animate-fade-in-up text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-100">
                    <Send className="w-10 h-10 text-google-blue ml-1" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">Verify Your Email</h2>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        We have sent you a verification email to <span className="font-bold text-slate-800">{email}</span>.
                    </p>
                </div>
                <p className="text-sm text-slate-500 mb-8">
                    Please click the link in the email to verify your account, then log in to access the Architect.
                </p>
                
                <button 
                    onClick={handleVerificationReset}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition transform active:scale-95 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                    Log In
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      );
  }

  // 2. Forgot Password View
  if (isResettingPassword) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
             <div onClick={() => { setIsResettingPassword(false); setError(''); setSuccessMsg(''); }} className="cursor-pointer flex items-center gap-2 mb-8 text-slate-500 hover:text-slate-900 transition">
                <Layout className="w-5 h-5" />
                <span className="font-bold uppercase tracking-widest text-xs">Back to Login</span>
            </div>
            
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-100">
                        <KeyRound className="w-8 h-8 text-google-blue" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h2>
                    <p className="text-slate-500 text-sm">Enter your email to receive a reset link.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-red-100">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="leading-snug">{error}</span>
                    </div>
                )}

                {successMsg ? (
                    <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 text-center mb-6">
                        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-600" />
                        <p className="font-bold text-lg mb-1">Check your inbox!</p>
                        <p className="text-sm">We've sent a password reset link to <span className="font-bold">{email}</span>.</p>
                        <button 
                            onClick={() => { setIsResettingPassword(false); setSuccessMsg(''); }}
                            className="mt-4 text-xs font-bold uppercase tracking-widest text-green-800 hover:underline"
                        >
                            Back to Sign In
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="reset-email" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                                <input 
                                    id="reset-email"
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition bg-slate-50 focus:bg-white"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition transform active:scale-95 flex items-center justify-center gap-2 mt-6 uppercase text-xs tracking-widest disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                        </button>
                    </form>
                )}
            </div>
        </div>
      );
  }

  // 3. Login / Signup View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div onClick={onBack} className="cursor-pointer flex items-center gap-2 mb-8 text-slate-500 hover:text-slate-900 transition">
         <Layout className="w-5 h-5" />
         <span className="font-bold uppercase tracking-widest text-xs">Return Home</span>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 mb-2">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-500 text-sm">Enter your details to access the Architect.</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="auth-email" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
            <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                <input 
                    id="auth-email"
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition bg-slate-50 focus:bg-white"
                    placeholder="name@company.com"
                />
            </div>
          </div>
          <div className="space-y-2">
             <div className="flex justify-between items-center">
                 <label htmlFor="auth-password" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                 {view === 'login' && (
                     <button 
                        type="button"
                        onClick={() => setIsResettingPassword(true)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide hover:underline"
                     >
                         Forgot Password?
                     </button>
                 )}
             </div>
             <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                <input 
                    id="auth-password"
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition transform active:scale-95 flex items-center justify-center gap-2 mt-6 uppercase text-xs tracking-widest disabled:opacity-70"
          >
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (view === 'login' ? 'Sign In' : 'Create Account')}
             {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Or</span>
            <div className="h-px bg-slate-100 flex-1"></div>
        </div>

        <button onClick={handleGoogle} className="w-full bg-white border-2 border-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
        </button>

        <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
                {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button onClick={() => onSwitchView(view === 'login' ? 'signup' : 'login')} className="font-bold text-blue-600 hover:text-blue-800 transition">
                    {view === 'login' ? 'Sign Up' : 'Log In'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
