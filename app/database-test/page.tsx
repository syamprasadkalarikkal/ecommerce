'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SimpleSupabaseTest() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    console.log(message);
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      addResult('Starting Supabase connection test...');

      // Test 1: Basic connection
      addResult('Testing basic Supabase connection...');
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          addResult(`Auth session error: ${error.message}`);
          addResult(`Error name: ${error.name}`);
          addResult(`Error stack: ${error.stack || 'No stack trace'}`);
        } else {
          addResult('Auth session retrieved successfully');
          if (data.session?.user) {
            addResult(`User logged in: ${data.session.user.email}`);
            addResult(`User ID: ${data.session.user.id}`);
          } else {
            addResult('No user currently logged in');
          }
        }
      } catch (authError) {
        addResult(`Auth connection failed: ${String(authError)}`);
        addResult(`Type: ${typeof authError}`);
        addResult(`JSON: ${JSON.stringify(authError, null, 2)}`);
      }

      // Test 2: Test database connection
      addResult('Testing database connection...');
      try {
        const {  error } = await supabase
          .from('nonexistent_table_test')
          .select('*')
          .limit(1);
        
        if (error) {
          addResult(`Expected error (testing connection): ${error.message}`);
          addResult(`Error code: ${error.code || 'No code'}`);
          addResult(`Error details: ${JSON.stringify(error.details) || 'No details'}`);
          addResult(`Error hint: ${error.hint || 'No hint'}`);
          
          if (error.message.includes('does not exist') || error.code === 'PGRST116') {
            addResult('Database connection working (got expected table not found error)');
          } else {
            addResult('Unexpected database error');
          }
        } else {
          addResult('Unexpected success with nonexistent table');
        }
      } catch (dbError) {
        addResult(`Database connection failed: ${String(dbError)}`);
        addResult(`Type: ${typeof dbError}`);
        addResult(`JSON: ${JSON.stringify(dbError, null, 2)}`);
      }

      // Test 3: Access cart table
      addResult('Testing cart table access...');
      try {
        const { data, error } = await supabase
          .from('cart')
          .select('*')
          .limit(1);
        
        if (error) {
          addResult(`Cart table error: ${error.message}`);
          addResult(`Error code: ${error.code || 'No code'}`);
          addResult(`Error details: ${JSON.stringify(error.details) || 'No details'}`);
          addResult(`Error hint: ${error.hint || 'No hint'}`);
          addResult(`Full error object: ${JSON.stringify(error, null, 2)}`);
          
          if (error.message.includes('does not exist') || error.code === 'PGRST116') {
            addResult('Cart table does not exist - this is likely your issue');
            addResult('You need to create the cart table in Supabase');
          }
        } else {
          addResult('Cart table exists and accessible');
          addResult(`Found ${data?.length || 0} records`);
        }
      } catch (cartError) {
        addResult(`Cart table access failed: ${String(cartError)}`);
        addResult(`Type: ${typeof cartError}`);
        addResult(`JSON: ${JSON.stringify(cartError, null, 2)}`);
      }

      addResult('Test completed');

    } catch (generalError) {
      addResult(`General error: ${String(generalError)}`);
      addResult(`Type: ${typeof generalError}`);
      addResult(`JSON: ${JSON.stringify(generalError, null, 2)}`);
    }
    
    setIsLoading(false);
  };

  const createCartTable = () => {
    addResult('To create the cart table, follow these steps:');
    addResult('1. Open your Supabase dashboard');
    addResult('2. Go to SQL Editor');
    addResult('3. Run this SQL:');
    addResult('');
    addResult('CREATE TABLE cart (');
    addResult('  id SERIAL PRIMARY KEY,');
    addResult('  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,');
    addResult('  product_id INTEGER NOT NULL,');
    addResult('  product_name VARCHAR(255) NOT NULL,');
    addResult('  product_price DECIMAL(10,2) NOT NULL,');
    addResult('  product_image TEXT,');
    addResult('  product_description TEXT,');
    addResult('  product_category VARCHAR(100),');
    addResult('  quantity INTEGER DEFAULT 1,');
    addResult('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    addResult('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    addResult('  UNIQUE(user_id, product_id)');
    addResult(');');
    addResult('');
    addResult('ALTER TABLE cart ENABLE ROW LEVEL SECURITY;');
    addResult('');
    addResult('CREATE POLICY "Users can view their own cart items" ON cart');
    addResult('  FOR SELECT USING (auth.uid() = user_id);');
    addResult('');
    addResult('CREATE POLICY "Users can insert their own cart items" ON cart');
    addResult('  FOR INSERT WITH CHECK (auth.uid() = user_id);');
    addResult('');
    addResult('CREATE POLICY "Users can update their own cart items" ON cart');
    addResult('  FOR UPDATE USING (auth.uid() = user_id);');
    addResult('');
    addResult('CREATE POLICY "Users can delete their own cart items" ON cart');
    addResult('  FOR DELETE USING (auth.uid() = user_id);');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Debugger</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={testSupabaseConnection}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Run Connection Test'}
        </button>
        
        <button
          onClick={createCartTable}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Show Table Creation SQL
        </button>
      </div>

      <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-auto max-h-96">
        {results.length === 0 ? (
          <p className="text-gray-500 mb-6">The product you&apos;re looking for could not be found in your cart.</p>
        ) : (
          results.map((result, index) => (
            <div key={index} className="mb-1">
              {result}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="font-bold text-yellow-800 mb-2">Quick Fix Steps:</h2>
        <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
          <li>Run the connection test above</li>
          <li>If you see Cart table does not exist, thats your problem</li>
          <li>Click Show Table Creation SQL to get the SQL code</li>
          <li>Go to Supabase Dashboard → SQL Editor</li>
          <li>Paste and run the SQL code</li>
          <li>Run the test again to verify it works</li>
        </ol>
      </div>
    </div>
  );
}
