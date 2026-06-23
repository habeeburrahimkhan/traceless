import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import url from 'url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            try {
              const parsedUrl = url.parse(req.url, true);
              const endpoint = parsedUrl.pathname?.replace(/^\/api\//, '');
              
              if (!endpoint) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing endpoint' }));
                return;
              }

              const projectRoot = server.config.root;
              const filePath = path.resolve(projectRoot, `api/${endpoint}.ts`);

              if (!fs.existsSync(filePath)) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `API endpoint ${endpoint} not found` }));
                return;
              }

              let body: any = {};
              if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                const buffers = [];
                for await (const chunk of req) {
                  buffers.push(chunk);
                }
                const rawBody = Buffer.concat(buffers).toString('utf-8');
                try {
                  body = rawBody ? JSON.parse(rawBody) : {};
                } catch (e) {
                  body = rawBody;
                }
              }

              const module = await server.ssrLoadModule(filePath);
              const handler = module.default;

              if (typeof handler !== 'function') {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Endpoint ${endpoint} does not export a default handler` }));
                return;
              }

              const vercelReq = Object.assign(req, {
                query: parsedUrl.query,
                body: body,
              });

              const vercelRes = Object.assign(res, {
                status(code: number) {
                  res.statusCode = code;
                  return vercelRes;
                },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return vercelRes;
                },
                send(data: any) {
                  res.end(data);
                  return vercelRes;
                }
              });

              await handler(vercelReq, vercelRes);
            } catch (error: any) {
              console.error(`Error in API endpoint ${req.url}:`, error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
            }
          } else {
            next();
          }
        });
      }
    }
  ]
  }
})

