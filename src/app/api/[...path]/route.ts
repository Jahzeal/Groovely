import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://groovely-github-repo.onrender.com';

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

  // Retry up to 4 times (total ~40-50s) to survive Render's cold start / Node 10s ConnectTimeout
  const maxRetries = 4;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const backendResponse = await fetch(destination, {
        method,
        headers: forwardHeaders,
        body: bodyBuffer,
        signal: AbortSignal.timeout(20_000), // Wait up to 20s per attempt
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
      lastError = error;
      const isTimeout =
        error?.name === 'TimeoutError' ||
        error?.message?.includes('Connect Timeout Error');

      if (!isTimeout || attempt === maxRetries) {
        break; // Break and send the error response if it's not a timeout, or we ran out of attempts
      }
      
      console.log(`[API Proxy] Render backend still waking up (Attempt ${attempt}/${maxRetries}). Retrying...`);
      // Wait 2 seconds before retrying
      await new Promise((resume) => setTimeout(resume, 2000));
    }
  }

  console.error(`[API Proxy] Failed to reach backend at ${destination} after ${maxRetries} attempts:`, lastError);

  return NextResponse.json(
    {
      error: 'Backend is waking up (Render cold start) and taking longer than expected. Please try ignoring and clicking connect again.',
      destination,
      detail: lastError?.message || lastError?.toString(),
    },
    { status: 503 }
  );
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;

