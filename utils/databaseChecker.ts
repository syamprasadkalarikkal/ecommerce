
import { supabase } from '@/lib/supabaseClient';

export async function checkDatabaseSetup() {
  console.log('🔍 Checking database setup...');
  
  try {
   
    console.log('1. Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('_anything_') 
      .select('*')
      .limit(1);
    
    if (connectionError) {
      if (connectionError.message.includes('relation "_anything_" does not exist')) {
        console.log('Supabase connection successful');
      } else {
        console.error(' Supabase connection failed:', connectionError);
        return false;
      }
    }

  
    console.log('2. Checking if cart table exists...');
    const { data: cartData, error: cartError } = await supabase
      .from('cart')
      .select('*')
      .limit(1);

    if (cartError) {
      if (cartError.code === 'PGRST116' || cartError.message.includes('relation "cart" does not exist')) {
        console.error('Cart table does not exist!');
        console.log('📝 You need to create the cart table first. Run this SQL in Supabase SQL Editor:');
        console.log(`
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  product_image TEXT,
  product_description TEXT,
  product_category VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items" ON cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart
  FOR DELETE USING (auth.uid() = user_id);
        `);
        return false;
      } else {
        console.error(' Error accessing cart table:', cartError);
        return false;
      }
    } else {
      console.log('Cart table exists and is accessible');
    }

    // 3. Check authentication
    console.log('3. Checking authentication setup...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Authentication error:', authError);
      return false;
    }
    
    if (authData.session) {
      console.log('User is authenticated:', authData.session.user.email);
    } else {
      console.log('No user currently authenticated');
    }

    // 4. Test cart operations (if authenticated)
    if (authData.session?.user?.id) {
      console.log('4. Testing cart operations...');
      
      const { data: userCartData, error: userCartError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', authData.session.user.id);

      if (userCartError) {
        console.error(' Error loading user cart:', userCartError);
        return false;
      } else {
        console.log(' User cart loaded successfully:', userCartData?.length || 0, 'items');
      }
    }

    console.log('Database setup check completed successfully!');
    return true;

  } catch (error) {
    console.error('Unexpected error during database check:', error);
    return false;
  }
}

