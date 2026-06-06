import { importToLichess } from "./api";
import { extractPGN } from "./extractor";
import { setupLichessButton, updateButtonState } from "./ui";
import { createLogger } from "./logger";

const logger = createLogger("Main");

async function handleExport(): Promise<void> {
  logger.debug("handleExport() called");
  updateButtonState("loading");

  try {
    logger.info("Extracting PGN from page...");
    const pgn = await extractPGN();
    logger.info(`PGN extracted successfully, length: ${pgn?.length || 0}`);
    
    if (!pgn) {
      logger.warn("PGN extraction returned null or empty");
      throw new Error("Could not extract PGN. Ensure the game is finished.");
    }

    logger.info("Sending PGN to Lichess API...");
    const lichessUrl = await importToLichess(pgn);
    logger.info(`Lichess import successful, URL: ${lichessUrl}`);

    logger.info("Opening Lichess URL in new window...");
    const newWindow = window.open(lichessUrl, "_blank");
    if (!newWindow) {
      logger.warn("window.open() returned null - popup may have been blocked");
    } else {
      logger.debug("Window opened successfully");
    }
    updateButtonState("success");
  } catch (error) {
    logger.error("Error in handleExport():", error);
    logger.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    logger.error("Error message:", error instanceof Error ? error.message : String(error));
    alert(error instanceof Error ? error.message : "Unknown error occurred.");
    updateButtonState("error");
  } finally {
    logger.debug("Resetting button state to idle");
    setTimeout(() => updateButtonState("idle"), 2000);
  }
}

logger.info("Initializing button observer...");
try {
  setupLichessButton(handleExport);
} catch (error) {
  logger.error("Error during button observer setup:", error);
}

