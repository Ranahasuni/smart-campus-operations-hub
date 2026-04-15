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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Booking Verification</h1>
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <p className="text-slate-500 font-medium">Verifying your reservation...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-700">Verification Successful</h2>
                        <p className="text-slate-600">{message}</p>
                        <div className="mt-8 pt-6 border-t border-slate-100 w-full">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Authorized Access</p>
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
