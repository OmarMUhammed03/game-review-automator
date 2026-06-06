import { createLogger } from "./logger";

const logger = createLogger("Extractor");

function extractFromPageSource(): string | null {
  logger.debug("extractFromPageSource() called");
  const html = document.documentElement.innerHTML;
  const pgnRegex = /(\[Event ".*?"\][\s\S]{50,}\s*(?:1-0|0-1|1\/2-1\/2|\*))/;
  const match = html.match(pgnRegex);

  if (match) {
    logger.debug("Regex match found in page source");
    return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }

  return null;
}

async function fetchPgnFromPublicApi(
  gameType: string,
  gameId: string,
): Promise<string | null> {
  logger.debug("fetchPgnFromPublicApi() called");

  const callbackUrl = `https://www.chess.com/callback/${gameType}/game/${gameId}`;
  logger.debug(`Fetching metadata from callback endpoint: ${callbackUrl}`);

  const callbackResponse = await fetch(callbackUrl);
  if (!callbackResponse.ok) {
    throw new Error(
      `Chess.com callback API error (Status: ${callbackResponse.status})`,
    );
  }

  const callbackData = await callbackResponse.json();
  logger.debug("Callback API response parsed successfully");

  const pgnHeaders =
    callbackData?.game?.pgnHeaders ?? callbackData?.game?.pgnheader;

  if (!pgnHeaders) {
    logger.warn(
      "No pgnHeaders found in callback response, cannot do two-hop lookup",
    );
    return null;
  }

  const whitePlayer: string | undefined = pgnHeaders.White;
  const date: string | undefined = pgnHeaders.Date;

  if (!whitePlayer || !date) {
    logger.warn(
      `Missing White player or Date in pgnHeaders (White: ${whitePlayer}, Date: ${date})`,
    );
    return null;
  }

  const dateParts = date.split(".");
  if (dateParts.length < 2) {
    logger.warn(`Unexpected date format: ${date}`);
    return null;
  }
  const [year, month] = dateParts;
  const username = whitePlayer.toLowerCase();

  logger.info(
    `Two-hop: fetching archive for player "${username}" (${year}/${month})`,
  );

  const archiveUrl = `https://api.chess.com/pub/player/${username}/games/${year}/${month}`;
  logger.debug(`Fetching game archive: ${archiveUrl}`);

  const archiveResponse = await fetch(archiveUrl);
  if (!archiveResponse.ok) {
    throw new Error(
      `Chess.com archive API error for player "${username}" (Status: ${archiveResponse.status})`,
    );
  }

  const archiveData = await archiveResponse.json();
  const games: Array<{ url?: string; pgn?: string }> = archiveData?.games ?? [];

  logger.debug(
    `Archive returned ${games.length} game(s), searching for ID ${gameId}...`,
  );

  const targetGame = games.find((g) => g.url && g.url.includes(gameId));

  if (!targetGame) {
    logger.warn(
      `Game ID ${gameId} not found in archive for player "${username}" (${year}/${month}). ` +
        "The game may not yet be indexed by the public API — try again in a moment.",
    );
    return null;
  }

  if (!targetGame.pgn) {
    logger.warn("Found the game in archive but its pgn field is empty");
    return null;
  }

  logger.info("Successfully retrieved PGN from Chess.com Public API archive");
  return targetGame.pgn;
}

export async function extractPGN(): Promise<string | null> {
  logger.debug("extractPGN() called");
  const url = window.location.href;

  const pathIdMatch = window.location.pathname.match(/\/(\d{5,})/);

  if (!pathIdMatch) {
    logger.error(`Could not find a valid game ID in the URL path. URL: ${url}`);
    throw new Error(
      "Could not find a valid game ID in the URL. Are you on a game page?",
    );
  }

  const gameId = pathIdMatch[1];

  const typeMatch = url.match(/(live|daily|computer)/);
  const gameType = typeMatch ? typeMatch[1] : "live";

  logger.info(`Extracted gameType: ${gameType}, gameId: ${gameId}`);

  try {
    const pgn = await fetchPgnFromPublicApi(gameType, gameId);
    if (pgn) {
      return pgn;
    }
    logger.warn(
      "Public API lookup returned null. Falling back to page source scrape.",
    );
  } catch (error) {
    logger.warn(
      "Public API lookup failed. Falling back to page source scrape.",
      error,
    );
  }

  logger.debug("Attempting to extract PGN from page source...");
  const pgn = extractFromPageSource();
  if (pgn) {
    logger.info("Successfully extracted PGN from page source");
  } else {
    logger.warn("Failed to extract PGN from page source");
  }
  return pgn;
}
