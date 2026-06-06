// Publiczne ID profilu widoczne dla frontendu.
// Nie pokazujemy zwyklego ID z bazy, bo to potem robi niepotrzebny syf w API.
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverConfig } from "./config.js";

const PUBLIC_PROFILE_PREFIX = "profile-";
const PUBLIC_PROFILE_DIGEST_LENGTH = 24;

export function createPublicProfileId(userRow) {
  const digest = createHmac("sha256", serverConfig.jwtSecret)
    .update(`${Number(userRow.id)}:${String(userRow.login || "")}`)
    .digest("hex")
    .slice(0, PUBLIC_PROFILE_DIGEST_LENGTH);
  return `${PUBLIC_PROFILE_PREFIX}${digest}`;
}

export function isValidPublicProfileId(value) {
  return new RegExp(`^${PUBLIC_PROFILE_PREFIX}[a-f0-9]{${PUBLIC_PROFILE_DIGEST_LENGTH}}$`).test(String(value || ""));
}

export function matchesPublicProfileId(userRow, publicProfileId) {
  const expected = createPublicProfileId(userRow);
  const received = String(publicProfileId || "");
  if (expected.length !== received.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}
