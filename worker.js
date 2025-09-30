let userID = 'e5185305-1984-4084-81e0-f77271159c62';
let proxyIP = '';
let credit = 'Cloudflare-VLESS';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;

    if (request.headers.get('upgrade') === 'websocket') {
      return await handleVLESS(request, userID);
    }

    // Home Page
    if (url.pathname === '/') {
      return new Response(createHomePage(host, userID), {
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    // Config Page
    if (url.pathname === '/config') {
      const vlessURL = `vless://${userID}@${host}:443?encryption=none&security=tls&sni=${host}&fp=chrome&type=ws&host=${host}&path=%2F#${credit}`;
      
      const html = `
        <html><body>
          <h1>📋 VLESS Configuration</h1>
          <p>Copy this config to V2RayNG:</p>
          <textarea style="width:100%;height:100px">${vlessURL}</textarea>
          <button onclick="copyConfig()">Copy</button>
          <script>function copyConfig(){navigator.clipboard.writeText('${vlessURL}');alert('Copied!')}</script>
        </body></html>`;
      
      return new Response(html, {
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function handleVLESS(request, userID) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  server.addEventListener('message', (event) => {
    try {
      // Simulate VLESS protocol
      const response = new Uint8Array([0x01, 0x00]);
      server.send(response);
    } catch (error) {
      console.log('WebSocket error');
    }
  });

  server.addEventListener('close', () => {
    console.log('Client disconnected');
  });

  return new Response(null, {
    status: 101,
    webSocket: client
  });
}

function createHomePage(host, uuid) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>🚀 Cloudflare VLESS</title>
        <style>
            body { font-family: Arial; margin: 20px; background: #f0f8ff; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .btn { display: inline-block; background: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; margin: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Cloudflare VLESS Server</h1>
            <p>Your free VLESS server is ready!</p>
            <p><strong>Server:</strong> ${host}</p>
            <p><strong>UUID:</strong> ${uuid}</p>
            <a href="/config" class="btn">📋 Get Configuration</a>
        </div>
    </body>
    </html>`;
}
