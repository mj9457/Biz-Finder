import "server-only";

export function getCompanyCsvDownloadAuthCode() {
  const authCode = process.env.COMPANY_CSV_DOWNLOAD_AUTH_CODE?.trim();

  if (!authCode) {
    throw new Error("Missing COMPANY_CSV_DOWNLOAD_AUTH_CODE.");
  }

  return authCode;
}
