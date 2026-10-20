import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

const supabase = insforgeAdmin.database;

export async function POST(req: NextRequest) {
  try {
    const { customerPhone, orderId, storeDomain } = await req.json();

    if (!customerPhone || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find and update the abandoned form
    let query = supabase
      .from('abandoned_forms')
      .update({
        status: 'converted',
        converted_order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .eq('customer_phone', customerPhone);

    if (storeDomain) {
      query = query.eq('store_domain', storeDomain);
    }

    const { error } = await query;

    if (error) {
      console.error('Error converting abandoned form:', error);
      return NextResponse.json(
        { error: 'Failed to convert abandoned form' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Abandoned form converted to order',
    });
  } catch (error) {
    console.error('Convert form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
