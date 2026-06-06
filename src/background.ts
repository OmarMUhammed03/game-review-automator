import { createLogger } from "./logger";

const logger = createLogger("Background");

logger.info("Background service worker initialized");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.debug("Received message:", message);

  if (message.action === "importToLichess") {
    const { pgn } = message;

    handleImport(pgn)
      .then((url) => {
        logger.info("Import successful, sending response URL:", url);
        sendResponse({ success: true, url });
      })
      .catch((error) => {
        logger.error("Import failed, sending error response:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    // Return true to indicate we will respond asynchronously
    return true;
  }
});

async function handleImport(pgn: string): Promise<string> {
  logger.debug("handleImport() called, making fetch request to Lichess...");

  const response = await fetch("https://lichess.org/api/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      pgn: pgn,
      analyse: "on",
    }),
  });

  logger.debug(`Fetch response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    throw new Error(
      `Lichess API error: ${response.statusText} (Status: ${response.status})`,
    );
  }

  // The Lichess API redirects to the game page URL.
  // Since redirects are transparently followed, response.url will be the final redirected game page URL.
  logger.info(`Final redirected URL: ${response.url}`);
  return response.url;
}
