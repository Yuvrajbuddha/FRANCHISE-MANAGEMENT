import express from "express";
import { createServer as createViteServer } from "vite";
import apiApp from "./backend/server";

const app = express();
// Dev server must run on port 3000 per environment constraints
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Serve uploaded CCTV footage and extracted frames
app.use("/uploads", express.static("uploads"));

// Mount the clean API app strictly on /api
app.use("/api", apiApp);

// Rewrite non-prefixed API requests to /api so Express router matches accurately without baseUrl stripping
app.use((req, res, next) => {
  if (
    req.path.startsWith("/store/outlets") ||
    req.path.startsWith("/store/accounts") ||
    req.path.startsWith("/store/credentials") ||
    req.path.startsWith("/store/login") ||
    req.path.startsWith("/auth/")
  ) {
    req.url = req.url.startsWith("/api") ? req.url : `/api${req.url}`;
    return apiApp(req, res, next);
  }
  next();
});

// Explicit guard: any request to /api that wasn't handled by apiApp must return JSON 404, NEVER fall through to Vite SPA
app.use("/api", (req, res) => {
  res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found.` });
});

async function startServer() {
  if (process.env.VERCEL === "1") {
    return;
  }

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
export { app };
