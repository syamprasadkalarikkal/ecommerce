'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import style from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      setError(error.message);
    } else {
      setError('');
      router.push('/');
    }
  };

  const handleOtpRedirect = () => {
    router.push('/otp-login');
  };

  return (
    <div className={style.main}>
      <span className="text-2xl font-bold text-indigo-600">veriDeal</span>
      <div className={style.container}>
        <h1 className={style.heading}>Login</h1>

        <form onSubmit={handlePasswordLogin}>
          <div className={style.inputcontainer}>
            <label className={style.label} htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              className={style.input}
              required
            />
          </div>

          <div className={style.inputcontainer}>
            <label className={style.label} htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={style.input}
              required
            />
          </div>

          <button type="submit" className={style.button}>
            Sign in with Password
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <h2 className={style.or}>or</h2>

        <button
          type="button"
          onClick={handleOtpRedirect}
          className={style.button}
        >
          Sign in with OTP
        </button>

        <div className="text-center mt-4">
          <p className={style.paragraph}>
            Don&apos;t have an account?{' '}
            <Link href="/create" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
