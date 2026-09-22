import { NextResponse } from 'next/server';
import { globalStore, SaaSProduct } from '@/lib/store';

export async function GET() {
  const products = Array.from(globalStore.products.values());
  return NextResponse.json({ success: true, count: products.length, data: products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, merchantId = 'm_midnight_001', icon = 'Package' } = body;

    if (!name || !description) {
      return NextResponse.json({ success: false, error: 'Product name and description are required' }, { status: 400 });
    }

    const newProduct: SaaSProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      merchantId,
      name,
      description,
      category: category || 'General SaaS',
      icon,
      createdAt: Date.now()
    };

    globalStore.products.set(newProduct.id, newProduct);
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
