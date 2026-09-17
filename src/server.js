const http = require("node:http");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const appName = process.env.APP_NAME || "AZ-400 Actions Lab";
const environment = process.env.APP_ENV || "local";

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function requestHandler(request, response) {
  if (request.url === "/health") {
    sendJson(response, 200, { status: "ok", environment });
    return;
  }

  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${appName}</title>
    <style>
      :root { color-scheme: dark; font-family: Georgia, "Times New Roman", serif; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; color: #f8fafc; background: #08212b; }
      main { width: min(760px, calc(100% - 32px)); margin: 0 auto; padding: 72px 0; }
      header { border-bottom: 1px solid #58717a; padding-bottom: 28px; }
      .eyebrow { color: #57c7ff; font: 700 13px/1.2 Consolas, monospace; text-transform: uppercase; }
      h1 { max-width: 650px; margin: 12px 0; font-size: clamp(38px, 8vw, 72px); line-height: .95; letter-spacing: 0; }
      .status { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; font-family: Consolas, monospace; }
      .status::before { width: 10px; height: 10px; border-radius: 50%; background: #55d187; content: ""; }
      section { padding-top: 34px; }
      ol { display: grid; gap: 14px; padding-left: 24px; }
      li { padding-left: 8px; color: #c7d8de; }
      code { color: #ffd166; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div class="eyebrow">GitHub Actions + Docker + Azure</div>
        <h1>${appName}</h1>
        <div class="status">Running in ${environment}</div>
      </header>
      <section>
        <h2>Pipeline path</h2>
        <ol>
          <li>Validate and test the Node.js service.</li>
          <li>Publish test results as a workflow artifact.</li>
          <li>Build a multi-stage Docker image.</li>
          <li>Deploy the image to Azure App Service.</li>
        </ol>
        <p>Health check: <code>/health</code></p>
      </section>
    </main>
  </body>
</html>`);
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function createServer() {
  return http.createServer(requestHandler);
}

if (require.main === module) {
  createServer().listen(port, "0.0.0.0", () => {
    console.log(`${appName} listening on port ${port}`);
  });
}

module.exports = { createServer };
