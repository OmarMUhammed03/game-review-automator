import { createLogger } from "./logger";

type ButtonState = "idle" | "loading" | "success" | "error";
const logger = createLogger("UI");

function isGamePage(): boolean {
  const path = window.location.pathname;
  return (
    path.startsWith("/game/") ||
    path.includes("/live") ||
    path.startsWith("/analysis")
  );
}

export function injectLichessButton(onClick: () => void): void {
  logger.debug("injectLichessButton() called");

  try {
    const existingBtn = document.getElementById("custom-lichess-btn");
    if (existingBtn) {
      return;
    }

    logger.debug("Creating new button element...");
    const btn = document.createElement("button");
    btn.id = "custom-lichess-btn";
    btn.innerText = "🔍 Analyze on Lichess";
    btn.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        background-color: #329932; color: white; border: none;
        padding: 10px 15px; font-size: 16px; font-weight: bold;
        border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        transition: background-color 0.3s;
    `;

    logger.debug("Adding click event listener...");
    try {
      btn.addEventListener("click", onClick);
      logger.debug("Event listener added successfully");
    } catch (listenerError) {
      logger.error("Error adding event listener:", listenerError);
      throw listenerError;
    }

    logger.debug("Appending button to document body...");
    if (!document.body) {
      logger.error("document.body is not available");
      throw new Error("document.body is not available");
    }

    document.body.appendChild(btn);
    logger.info("Button injected successfully");
  } catch (error) {
    logger.error("Error in injectLichessButton():", error);
    throw error;
  }
}

export function setupLichessButton(onClick: () => void): void {
  logger.info("Setting up Lichess button controller...");

  const handleVisibility = () => {
    try {
      const shouldShow = isGamePage();
      const existingBtn = document.getElementById("custom-lichess-btn");

      if (shouldShow) {
        if (!existingBtn) {
          injectLichessButton(onClick);
        }
      } else {
        if (existingBtn) {
          existingBtn.remove();
          logger.info("Button removed (not on a game page)");
        }
      }
    } catch (error) {
      logger.error("Error handling button visibility:", error);
    }
  };

  // Run initial check once document is ready
  if (document.body) {
    handleVisibility();
  } else {
    window.addEventListener("DOMContentLoaded", handleVisibility);
  }

  // Observe direct children changes of document.body
  const bodyObserver = new MutationObserver(() => {
    handleVisibility();
  });

  if (document.body) {
    bodyObserver.observe(document.body, { childList: true, subtree: false });
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      if (document.body) {
        bodyObserver.observe(document.body, {
          childList: true,
          subtree: false,
        });
      }
    });
  }

  // Observe page title changes for SPA navigation detection
  const titleEl = document.querySelector("title");
  if (titleEl) {
    const titleObserver = new MutationObserver(() => {
      handleVisibility();
    });
    titleObserver.observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  // Listen to standard popstate for history navigation
  window.addEventListener("popstate", handleVisibility);
}

export function updateButtonState(state: ButtonState): void {
  logger.debug(`updateButtonState() called with state: ${state}`);

  try {
    const btn = document.getElementById(
      "custom-lichess-btn",
    ) as HTMLButtonElement | null;

    if (!btn) {
      logger.warn("Button not found, cannot update state");
      return;
    }

    logger.debug(`Updating button state to: ${state}`);
    switch (state) {
      case "loading":
        btn.innerText = "Exporting...";
        btn.style.backgroundColor = "#f39c12";
        logger.debug("Button updated to loading state");
        break;
      case "success":
        btn.innerText = "Success!";
        btn.style.backgroundColor = "#27ae60";
        logger.info("Button updated to success state");
        break;
      case "error":
        btn.innerText = "Failed";
        btn.style.backgroundColor = "#c0392b";
        logger.error("Button updated to error state");
        break;
      case "idle":
      default:
        btn.innerText = "Analyze on Lichess";
        btn.style.backgroundColor = "#329932";
        logger.debug("Button updated to idle state");
        break;
    }
  } catch (error) {
    logger.error("Error in updateButtonState():", error);
  }
}
