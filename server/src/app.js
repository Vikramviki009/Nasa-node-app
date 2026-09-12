import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import morgan from "morgan";
import api from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(morgan("combined"));
app.use(express.json());

// Serve static build files
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/v1", api);

// Client-side SPA routing fallback (serves index.html for all non-API GET requests)
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

export { app };
