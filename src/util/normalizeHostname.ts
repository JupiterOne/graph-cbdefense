export function normalizeHostname(deviceName: string): string {
  return deviceName
    ? deviceName
        .split(".")[0]
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^a-zA-z0-9\-]/g, "")
    : "";
}
