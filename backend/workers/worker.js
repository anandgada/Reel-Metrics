import { Worker } from "bullmq";
import mongoose from "mongoose";
import { chromium } from "playwright";
import Reel from "../models/Reel.js";
import scrapeReels from "../services/get_reels.js";
import { sleep } from "../utils/misc.js";
import { getCookieForPlaywright } from "../utils/cookie.js";

mongoose.connect("mongodb://localhost:27017/instagram");

/**
 *
 * @param {import("bullmq").Job<{usernames: string[], timeout?: number, jobId: string}>} job
 */
const workerHandler = async (job) => {
  const { usernames, timeout, jobId } = job.data;

  // Browser
  const browser = await chromium.launch({
    headless: process.env.DEBUG_PLAYWRIGHT === "true" ? false : true,
    // headless: false,
    channel: "chrome",
    timeout:
      timeout ||
      Number.parseInt(process.env.PLAYWRIGHT_DEFAULT_TIMEOUT) ||
      undefined,
  });

  let context;
  try {
    // Load the localStorage Values.
    const localStorage = Object.entries(
      JSON.parse(process.env.IG_LOCAL_JSON || "{}")
    ).map(([key, value]) => ({
      name: key,
      value,
    }));
    const cookies = getCookieForPlaywright();
    context = await browser.newContext({
      storageState: {
        cookies: cookies,
        origins: [
          {
            origin: "https://www.instagram.com",
            localStorage: localStorage,
          },
        ],
      },
    });
  } catch (err) {
    console.error("Error creating context:", err);
    // should throw error for bull to retry the job.
    throw err;
  }
  const page = await context.newPage();
  await page.goto("https://www.instagram.com/nandu.test/");

  // Scrape reel data
  for (const username of usernames) {
    const existingJob = await Reel.findOne({ username });
    const reel = existingJob
      ? await Reel.findOneAndUpdate(
          { username },
          {
            status: "queued",
            progress: 0,
            reels: [],
            jobId: jobId,
          },
          { new: true }
        )
      : await Reel.create({
          username,
          status: "queued",
          progress: 0,
          reels: [],
          jobId: jobId,
        });

    let reelId = reel._id;
    try {
      await Reel.findByIdAndUpdate(reelId, {
        status: "in_progress",
        progress: 0,
      });

      const reels = await scrapeReels(
        context,
        username,
        async (current, total) => {
          // Progress callback
          const progress = Math.round((current / total) * 100);
          await Reel.findByIdAndUpdate(reelId, { progress });
        }
      );

      await Reel.findByIdAndUpdate(reelId, {
        reels: reels,
        status: "completed",
        progress: 100,
        error: null,
      });

      // sleep for a second before moving to the next username.
      await sleep(1000);
    } catch (err) {
      console.error("error resp : ", err);
      await Reel.findByIdAndUpdate(reelId, {
        status: "failed",
      });
      return { status: "failed" };
    }
  }

  // Clean up session
  await page.close();
  await context.close();
  await browser.close();
};

export const scrapeWorker = new Worker("scrapeQueue", workerHandler, {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number.parseInt(process.env.REDIS_PORT) || 6378,
  },
  concurrency: 3,
});
