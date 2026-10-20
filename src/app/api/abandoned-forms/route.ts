import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';

const supabase = insforgeAdmin.database; // Map the database client so existing queries work

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      storeDomain,
      productId,
      productName,
      customerPhone,
      customerName,
      customerAddress,
      customerState,
      quantity,
      totalPrice,
      formData
    } = await req.json();

    console.log('Abandoned form POST request:', { userId, storeDomain, customerPhone });

    if (!storeDomain || !customerPhone) {
      console.error('Missing required fields:', { userId, storeDomain, customerPhone });
      return NextResponse.json(
        { error: 'Missing required fields', details: { userId, storeDomain, customerPhone } },
        { status: 400 }
      );
    }

    // Use a default user_id if not provided (for anonymous storefront submissions)
    const finalUserId = userId || '00000000-0000-0000-0000-000000000000';

    // Check if phone already exists for this store
    const { data: existing, error: selectError } = await supabase
      .from('abandoned_forms')
      .select('id, status')
      .eq('user_id', finalUserId)
      .eq('customer_phone', customerPhone)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing form:', selectError);
    }

    if (existing) {
      // Update existing record
      console.log('Updating existing form:', existing.id);
      const { data: updated, error: updateError } = await supabase
        .from('abandoned_forms')
        .update({
          product_id: productId,
          product_name: productName,
          customer_name: customerName,
          customer_address: customerAddress,
          customer_state: customerState,
          quantity: quantity,
          total_price: totalPrice,
          form_data: formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating abandoned form:', updateError);
        return NextResponse.json(
          { error: 'Failed to update abandoned form', details: updateError },
          { status: 500 }
        );
      }

      console.log('Form updated successfully:', updated.id);
      return NextResponse.json({
        success: true,
        formId: updated.id,
        message: 'Abandoned form updated',
      });
    }

    // Create new abandoned form record
    console.log('Creating new abandoned form');
    const { data: abandonedForm, error: insertError } = await supabase
      .from('abandoned_forms')
      .insert({
        user_id: finalUserId,
        store_domain: storeDomain,
        product_id: productId,
        product_name: productName,
        customer_phone: customerPhone,
        customer_name: customerName,
        customer_address: customerAddress,
        customer_state: customerState,
        quantity: quantity || 1,
        total_price: totalPrice,
        form_data: formData || {},
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating abandoned form record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create abandoned form record', details: insertError },
        { status: 500 }
      );
    }

    console.log('Form created successfully:', abandonedForm.id);
    return NextResponse.json({
      success: true,
      formId: abandonedForm.id,
      message: 'Abandoned form recorded',
    });
  } catch (error: any) {
    console.error('Abandoned form error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get abandoned forms for user
    const { data: forms, error } = await supabase
      .from('abandoned_forms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch abandoned forms' },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      total: forms?.length || 0,
      pending: forms?.filter((f: any) => f.status === 'pending').length || 0,
      contacted: forms?.filter((f: any) => f.status === 'contacted').length || 0,
      converted: forms?.filter((f: any) => f.status === 'converted').length || 0,
      abandoned: forms?.filter((f: any) => f.status === 'abandoned').length || 0,
      totalValue: forms?.reduce((sum: number, f: any) => sum + (f.total_price || 0), 0) || 0,
      convertedValue: forms?.filter((f: any) => f.status === 'converted').reduce((sum: number, f: any) => sum + (f.total_price || 0), 0) || 0,
      conversionRate: forms?.length ? ((forms.filter((f: any) => f.status === 'converted').length / forms.length) * 100).toFixed(1) : 0,
    };

    return NextResponse.json({
      success: true,
      forms,
      stats,
    });
  } catch (error) {
    console.error('Get abandoned forms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { formId, status, phoneCallCount } = await req.json();

    if (!formId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (phoneCallCount !== undefined) {
      updateData.phone_call_count = phoneCallCount;
      updateData.last_call_attempt = new Date().toISOString();
    }

    const { error } = await supabase
      .from('abandoned_forms')
      .update(updateData)
      .eq('id', formId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update form status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Form status updated',
    });
  } catch (error) {
    console.error('Update form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
