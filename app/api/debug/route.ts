import {serverFetch} from '@/lib/server/server-api';
import {NextResponse} from 'next/server';

export async function GET() {
  let output: any = {};
  try {
    // Check Backend API Connectivity
    const products = await serverFetch('/products?limit=1');
    output.backendStatus = 'online';
    output.sampleData = products;
  } catch (e: any) {
    output.backendStatus = 'offline';
    output.error = e.message;
  }

  return NextResponse.json(output);
}
