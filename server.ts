import express from "express";
import { createServer as createViteServer } from "vite";
import apiApp from "./backend/server";

const app = express();
const PORT = process.env.PORT || 3000;

// Mount the clean API app
app.use(apiApp);

async function startServer() {
  if (process.env.VERCEL === "1") {
    return;
  }

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
export { app };
