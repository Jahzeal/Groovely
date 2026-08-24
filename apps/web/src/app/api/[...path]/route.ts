import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://groovely-ttyi.onrender.com';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${BACKEND_URL}/api/${path.join('/')}`;

  const { search } = new URL(request.url);
  const destination = `${targetUrl}${search}`;

  console.log(`[API Proxy] ${request.method} -> ${destination}`);

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.delete('host');
  // Prevent backend from compressing, to avoid fetch() decompression header mismatch
  forwardHeaders.delete('accept-encoding');

  const method = request.method;
  let bodyBuffer: ArrayBuffer | undefined = undefined;

  if (method !== 'GET' && method !== 'HEAD') {
    bodyBuffer = await request.arrayBuffer();
  }

  try {
    const backendResponse = await fetch(destination, {
      method,
      headers: forwardHeaders,
      body: bodyBuffer,
      signal: AbortSignal.timeout(120_000), // Wait up to 120s for large track uploads
    });

    const contentType = backendResponse.headers.get('content-type') || '';
    const isText = contentType.includes('application/json') || contentType.includes('text/');
    
    let responseBody: any = backendResponse.body;
    if (isText && responseBody) {
       responseBody = await backendResponse.text();
    }

    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');
    if (isText) {
       responseHeaders.delete('content-encoding');
       responseHeaders.delete('content-length');
    }

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`[API Proxy] Failed to reach backend at ${destination}:`, error);

    const isTimeout = error?.name === 'TimeoutError' || error?.message?.includes('timeout');

    return NextResponse.json(
      {
        error: isTimeout 
          ? 'Upload is taking too long. Please try again with a smaller file or faster connection.' 
          : 'Failed to communicate with backend server.',
        destination,
        detail: error?.message || error?.toString(),
      },
      { status: 503 }
    );
  }
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;

