/**
 * @typedef {Object} Reel
 * @property {string} reelUrl - URL of the reel
 * @property {number} likes - Number of likes on the reel
 * @property {number} comments - Number of comments on the reel
 * @property {number} views - Number of views on the reel
 * @property {string} thumbnail - URL of the thumbnail image for the reel
 * @property {string} caption - Caption text for the reel
 * @property {number} postedAt - Timestamp when the reel was posted
 */

/**
 *
 * @description Parse the reel JSON into DB format
 *
 * @param {JSON} items Reels raw data from intercepted response
 * @param {*} progressCallback
 * @returns {Array}
 */
const posts = async (items, progressCallback) => {
  const updatedReels = [];
  // Process only the first 10 items for now.
  const itemsToProcess = Math.min(items.length, 10);

  for (let i = 0; i < itemsToProcess; i++) {
    const reelUrl = `https://www.instagram.com/reel/${items[i].node?.media?.code}/`;
    const likes = items[i].node?.media?.like_count || 0;
    const comments = items[i].node?.media?.comment_count || 0;
    const views = items[i].node?.media?.play_count || 0;
    const thumbnail = "";
    const caption = "";
    const postedAt = items[i].node?.taken_at_timestamp || 0;

    updatedReels.push({
      reelUrl: reelUrl,
      likes: likes,
      comments: comments,
      views: views,
      thumbnail: thumbnail,
      caption: caption,
      postedAt: postedAt,
    });

    if (progressCallback) {
      await progressCallback(i + 1, itemsToProcess);
    }
  }
  return updatedReels;
};

/**
 * @description Use Playwright context to intercept and get the reels information for the given username.
 *
 * @param {import("playwright-core").BrowserContext} context Browser context with a logged in user
 * @param {string} username Username to fetch the reels for
 * @param {Function} progressCallback Callback function to update progress
 * @returns {Promise<Array<Reel>>} Array of reels
 */
async function scrapeReels(context, username, progressCallback) {
  let reels = [];
  const page = await context.newPage();
  const reelsPromise = new Promise((resolve) => {
    const responseHandler = async (response) => {
      const url = response.url();
      // handle every graphql query and filter out the required API to get the reels info.
      if (url.includes("graphql/query")) {
        try {
          const data = await response.json();
          if (
            data &&
            data?.data &&
            data?.data?.xdt_api__v1__clips__user__connection_v2
          ) {
            const items =
              data.data.xdt_api__v1__clips__user__connection_v2.edges || [];
            reels = posts(items, progressCallback);
            page.off("response", responseHandler); // Remove the listener added for response interception.
            resolve(reels);
          }
        } catch (error) {
          console.error("Error processing response:", error);
        }
      }
    };
    // intercept for the responses i.e fetch calls.
    page.on("response", responseHandler);
  });

  const profileUrl = `https://www.instagram.com/${username}/reels/`;
  await page.goto(profileUrl);

  // Wait for reels to be loaded and returned from the response handler
  const result = await reelsPromise;
  await page.close();
  return result;
}

export default scrapeReels;
