import { createLogger } from "./logger";

const logger = createLogger("API");

export async function importToLichess(pgn: string): Promise<string> {
  logger.debug("importToLichess() called with PGN length:", pgn.length);

  return new Promise((resolve, reject) => {
    logger.debug("Sending importToLichess message to background script...");
    chrome.runtime.sendMessage(
      { action: "importToLichess", pgn },
      (response) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          logger.error("Runtime error sending message to background script:", lastError);
          reject(new Error(`Runtime error: ${lastError.message}`));
          return;
        }

        if (!response) {
          logger.error("No response received from background script");
          reject(new Error("No response received from background script"));
          return;
        }

        if (response.success) {
          logger.info("Successfully received Lichess URL from background script");
          resolve(response.url);
        } else {
          logger.error("Background script failed to import game:", response.error);
          reject(new Error(response.error || "Failed to import game to Lichess"));
        }
      }
    );
  });
}
