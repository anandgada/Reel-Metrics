import express from "express";
import mongoose from "mongoose";
import { Queue } from "bullmq";
import dotenv from "dotenv";
import crypto from "crypto";
import cors from "cors";
import Papa from "papaparse";
import Reel from "./models/Reel.js";

// first load the env variables then load the worker to have the env variables loaded.
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.dev",
});

import "./workers/worker.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    allowedHeaders: "*",
    exposedHeaders: "*",
    methods: "*",
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
  })
);

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/instagram",
  {}
);

const scrapeQueue = new Queue("scrapeQueue", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  },
  defaultJobOptions: {
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    attempts: 3,
  },
});

scrapeQueue.on("completed", async (job) => {
  console.log(`Job ${job.id} completed`);
});

scrapeQueue.on("failed", async (job, err) => {
  console.log(`Job ${job.id} failed: ${err.message}`);
});

scrapeQueue.on("waiting", async (job) => {
  console.log(`Job ${job.id} is waiting`);
});

app.post("/api/reels", async (req, res) => {
  const usernames = req?.body?.usernames;
  console.log("Received request for username:");
  if (!usernames) {
    return res.status(400).json({ error: "Usernames is required" });
  } else if (
    !Array.isArray(usernames) ||
    !usernames.every((item) => typeof item === "string")
  ) {
    return res.status(400).json({
      error: "Invalid input. Expected array of strings.",
      success: false,
    });
  }
  const jobId = crypto.randomUUID();
  try {
    await scrapeQueue.add("scrape", { usernames, jobId });

    res.json({
      success: true,
      message: "Reels fetching job has added to queue",
      id: jobId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reels/export", async (req, res) => {
  try {
    const allReels = await Reel.find({}, "-error");
    const headers = ["username", "reels"];
    const records = allReels.map((reel) => {
      return [reel.username, reel.reels.map((reel) => reel.reelUrl).join(",")];
    });
    const csv = Papa.unparse({
      fields: headers,
      data: records,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reels.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reels/{:id}", async (req, res) => {
  const shouldIncludeReels = req.query.includeReels === "true";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const jobId = req.query.jobId || undefined;
  const reelId = req.params.id;
  try {
    const jobs = await Reel.find(
      {
        ...(jobId ? { jobId } : {}),
        ...(reelId ? { _id: reelId } : {}),
      },
      shouldIncludeReels ? "-error" : "-reels -error",
      {
        skip: offset,
        limit: limit,
        sort: { updatedAt: -1 },
      }
    );
    res.json({ data: jobs, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
