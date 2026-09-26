// Produces a friendly display ID like ISS-1024 from a cuid, deterministic per issue.
export function friendlyIssueId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const num = 1000 + (hash % 9000);
  return `ISS-${num}`;
}
