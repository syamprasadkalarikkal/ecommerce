'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import style from '../login/login.module.css';

export default function OtpLoginPage() {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
      setError('');
    }
  };

  const verifyOtp = async () => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      setError(error.message);
    } else {
      setError('');
      router.push('/');
    }
  };

  return (
    <div className={style.main}>
      <h1 className={style.heading}>Phone OTP Login</h1>

    
      <div className={style.inputcontainer}>
        <label className={style.label} htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          type="tel"
          placeholder="+1234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={style.input}
          disabled={otpSent}
        />
      </div>

      
      {!otpSent && (
        <button
          onClick={sendOtp}
          className={style.button}
          disabled={phone.trim() === ''}
        >
          Send OTP
        </button>
      )}

      {otpSent && (
        <>
          <div className={style.inputcontainer} style={{ marginTop: '1rem' }}>
            <label className={style.label} htmlFor="otp">Enter OTP</label>
            <input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={style.input}
            />
          </div>
          <button onClick={verifyOtp} className={style.button}>Verify OTP</button>
        </>
      )}

      {/* Error message */}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
