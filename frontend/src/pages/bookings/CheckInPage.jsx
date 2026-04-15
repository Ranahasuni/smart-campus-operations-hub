import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default function CheckInPage() {
    const { bookingId } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const performCheckIn = async () => {
            try {
                const response = await fetch(`http://localhost:8082/api/check-in/${bookingId}`, {
                    method: 'POST'
                });
                const data = await response.json();
                
                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error. Could not connect to the verification server.');
            }
        };

        if (bookingId) performCheckIn();
    }, [bookingId]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-50">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 text-center border border-white/20">
                <h1 className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-indigo-600/60 mb-8">Smart Campus OS Hub</h1>
                <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Booking<br/>Verification</h2>
                <div className="w-12 h-1 bg-indigo-600/10 rounded-full mx-auto mb-10"></div>
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                            </div>
                        </div>
                        <div className="bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Verification in progress</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-700">Verification Successful</h2>
                        <p className="text-slate-600">{message}</p>
                        <div className="mt-8 pt-6 border-t border-slate-100 w-full flex flex-col gap-3">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Authorized Access</p>
                            <button 
                                onClick={() => window.location.href = '/profile'}
                                className="mt-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 py-2 px-4 rounded-xl transition-colors"
                            >
                                Continue to Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                            <XCircle className="w-12 h-12 text-rose-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-rose-700">Verification Failed</h2>
                        <p className="text-slate-600">{message}</p>
                        <div className="mt-8 pt-6 border-t border-slate-100 w-full flex flex-col gap-3">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Unauthorized / Invalid</p>
                            <button 
                                onClick={() => window.location.href = '/support'}
                                className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 py-2 px-4 rounded-xl transition-colors"
                            >
                                Contact Staff for Assistance
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
