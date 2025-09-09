import NodeCache from "node-cache";

export const sourceCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export function getSourceCacheKey(
  sourceId: string,
  from?: string | null,
  to?: string | null
) {
  const normFrom = from && from !== "" ? from : undefined;

  const normTo = to && to !== "" ? to : undefined;

  if (normFrom || normTo) {
    return `${sourceId}:${normFrom || "null"}:${normTo || "null"}`;
  }

  return sourceId;
}
