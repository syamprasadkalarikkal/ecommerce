// app/api/send-order-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { email, order } = body;

  if (!email || !order) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

const itemsHtml = (order.items as OrderItem[]).map((item) => (

    `<li>${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`
  )).join('');

  const html = `
    <h2>Order Confirmation - Order #${order.id}</h2>
    <p>Thank you for your order, ${order.customerInfo.firstName}!</p>
    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
    <h3>Items:</h3>
    <ul>${itemsHtml}</ul>
    <h3>Shipping Address:</h3>
    <p>
      ${order.customerInfo.firstName} ${order.customerInfo.lastName}<br/>
      ${order.customerInfo.address}<br/>
      ${order.customerInfo.city}, ${order.customerInfo.state} ${order.customerInfo.pincode}
    </p>
  `;

  try {
    const data = await resend.emails.send({
      from: 'VeriDeal <onboarding@resend.dev>',
      to: email,
      subject: `Your Order Confirmation (#${order.id})`,
      html
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Email failed to send' }, { status: 500 });
  }
}
