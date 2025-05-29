"use client"

import { useState, useEffect } from 'react';
import Add from '@/componenets/Add';
import Featured from '@/componenets/Featured';
import NewArrival from '@/componenets/NewArrival';




export default function Home() {
  
  const [, setMobileMenuOpen] = useState(false);
  
  
 
  
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main>
        <Add/>
        <Featured/>
        <NewArrival/>
      </main>
       
      

    </div>
  );
}