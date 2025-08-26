import { createInspiration, getInspirations, getInspiration, deleteInspiration } from './inspirations.js';

// Health check endpoint
export async function healthCheck() {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function handleRequest(request, env) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;
  const method = request.method;

  // API routes
  if (pathname.startsWith('/api/')) {
    // Health check
    if (pathname === '/api/health') {
      return healthCheck();
    }
    
    // Inspirations API
    if (pathname.startsWith('/api/inspirations')) {
      // Handle different HTTP methods and paths
      if (pathname === '/api/inspirations') {
        if (method === 'POST') {
          return await createInspiration(request, env);
        } else if (method === 'GET') {
          return await getInspirations(request, env);
        }
      } else if (pathname.match(/^\/api\/inspirations\/[^\/]+$/)) {
        const id = pathname.split('/').pop();
        if (method === 'GET') {
          return await getInspiration(id, env);
        } else if (method === 'DELETE') {
          return await deleteInspiration(id, env);
        }
      }
    }

    // If no API route matched
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: 'API endpoint not found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Serve static files (frontend)
  return serveStaticFile(pathname, env);
}

async function serveStaticFile(pathname, env) {
  // Default to index.html for root path
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // In Edge Functions, we can't access the file system directly
  // For development, return basic responses; in production, static files are served by CDN
  
  if (pathname === '/index.html') {
    return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inspiration List API</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; margin: 1rem 0; }
        .endpoint { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin: 0.5rem 0; }
        code { background: rgba(0,0,0,0.2); padding: 0.2rem 0.5rem; border-radius: 4px; }
        .method { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem; }
        .get { background: #10b981; }
        .post { background: #3b82f6; }
        .delete { background: #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎙️ Inspiration List API</h1>
        <div class="card">
            <h2>Development Mode</h2>
            <p>The backend API is running successfully! For the full frontend experience, please access:</p>
            <p><strong>Frontend:</strong> <a href="http://localhost:3000" style="color: #60a5fa;">http://localhost:3000</a></p>
            <p><strong>API:</strong> <a href="http://localhost:8787/api" style="color: #60a5fa;">http://localhost:8787/api</a></p>
        </div>
        
        <div class="card">
            <h2>Available API Endpoints</h2>
            
            <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/inspirations</code>
                <p>Create a new inspiration record with AI analysis</p>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/inspirations</code>
                <p>List inspirations with pagination and filtering</p>
            </div>
            
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/inspirations/{id}</code>
                <p>Get specific inspiration details</p>
            </div>
            
            <div class="endpoint">
                <span class="method delete">DELETE</span>
                <code>/api/inspirations/{id}</code>
                <p>Delete an inspiration record</p>
            </div>
        </div>
        
        <div class="card">
            <h2>Features</h2>
            <ul>
                <li>🎙️ Voice recording with MediaRecorder API</li>
                <li>🗣️ Speech-to-text with Web Speech API</li>
                <li>🤖 AI content analysis with Gemini</li>
                <li>💾 Data persistence with EdgeOne KV</li>
                <li>📱 Responsive PWA design</li>
            </ul>
        </div>
    </div>
</body>
</html>
    `, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
  
  // For other static files, return 404 with helpful message
  return new Response(JSON.stringify({
    error: 'Static File Not Found',
    message: 'Static files are served separately. Please access the frontend at http://localhost:3000',
    api_base_url: 'http://localhost:8787/api'
  }), { 
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}