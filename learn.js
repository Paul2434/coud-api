"use strict";

const http = require("http");
const httpProxy = require("http-proxy");

const PORT = process.env.PORT || 3000;

// --- CONFIGURATION POUR VOTRE DOMAINE ---
const TARGET = "https://blogstars.alexpro.online:8443";
const FORCED_HOST = "blogstars.alexpro.online";
const FORCED_PATH = "/ws";
// ---------------------------------------

const proxy = httpProxy.createProxyServer({
  target: TARGET,
  changeOrigin: false,
  ws: true,
  secure: true,
  headers: { Host: FORCED_HOST },
});

proxy.on("error", (err, req, res) => {
  console.error("[proxy error]", err.message);
  if (res && res.writeHead && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "text/plain" });
  }
  if (res && res.end) res.end("Bad gateway");
});

proxy.on("proxyRes", (proxyRes, req, res) => {
  console.log(
    `[${new Date().toISOString()}] Réponse backend : ${proxyRes.statusCode} ${proxyRes.statusMessage}`,
  );
});

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>blogstars.alexpro.online</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f4f4f9; }
          h1 { color: #333; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <h1>🚀 Bienvenue sur blogstars.alexpro.online</h1>
        <p>Ce site utilise une connexion sécurisée. Page d'accueil officielle.</p>
      </body>
      </html>
    `);
    return;
  }

  if (req.url !== "/") {
    console.log(
      `[${new Date().toISOString()}] Proxy vers Xray : ${req.method} ${req.url}`,
    );
    proxy.web(req, res);
  } else {
    res.writeHead(404);
    res.end("Page non trouvée");
  }
});

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(PORT, () => {
  console.log(
    `Relay HTTPS démarré sur le port ${PORT}, forward vers ${TARGET} (Host: ${FORCED_HOST})`,
  );
});
