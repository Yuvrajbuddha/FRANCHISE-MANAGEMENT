import apiApp from "../backend/server";

// Vercel Serverless Function entry point
export default function handler(req: any, res: any) {
  return apiApp(req, res);
}

