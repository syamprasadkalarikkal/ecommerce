'use client'
import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import style from './login.module.css'

 
export default function Home() {
  const [email, setEmail] = useState('');
  const [password,setPassword]=useState('');
  const [,setError]=useState('');
  const router=useRouter();
  const mySignupFunction = async (e: React.FormEvent) => {
  e.preventDefault();

  const cleanedEmail = email.trim().toLowerCase();

  console.log('Attempting to sign up:', cleanedEmail);

  const { data, error } = await supabase.auth.signUp({
    email: cleanedEmail,
    password,
  });

  if (error) {
    console.error('Supabase signUp error:', error);
    if (error.message.toLowerCase().includes("user already")) {
      alert("An account already exists. Try logging in.");
      router.push('/login');
    } else {
      alert('Signup failed: ' + error.message);
    }
    setError(error.message);
    return;
  }

  console.log('Signup successful. Data:', data);
  alert('Signup successful. Please check your email to confirm your account.');
  router.push('/login');
};




  return(
    <div className={style.main}>
      <span className="text-2xl font-bold text-indigo-600">veriDeal</span>

      <div className={style.container}> 
        <h1 className={style.heading}>Create Account </h1>
        <form onSubmit={mySignupFunction}>
          <div className={style.inputcontainer}>
            <label className={style.label} htmlFor='email'>Email:</label>
            <input type='email' id='email' placeholder='example@gmail.com'value={email}  onChange={(e)=>setEmail(e.target.value)} className={style.input} required/>
          </div>
          <div className={style.inputcontainer}>
            <label className={style.label} htmlFor="password">Password:</label>
            <input type='password' id ='password' placeholder='enter your password' value={password} onChange={(e)=>setPassword(e.target.value)} className={style.input} required/>
          </div>
          <div>
          <button type='submit' className={style.button}>Create</button>
          </div>
          <div>
            <h2 className={style.or}>or</h2>
          <button type='button' className={style.button} onClick={()=>router.push('/login')}>Login</button>
          </div>
        </form>
      </div>
      <hr className={style.hr}></hr>
    </div>
  );
}