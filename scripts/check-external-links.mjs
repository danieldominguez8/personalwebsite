import { LinkChecker } from "linkinator";

// Report-only: external sites are flaky, so this never fails the build.
const checker = new LinkChecker();
const result = await checker.check({
  path: "dist",
  recurse: true,
  retry: true,
  retryErrors: true,
  retryErrorsCount: 3,
  timeout: 15000,
  // LinkedIn answers bots with 999; mail links cannot be fetched.
  linksToSkip: async (link) => /^mailto:|linkedin\.com/.test(link),
});
const external = result.links.filter(
  (l) => /^https?:/.test(l.url) && !/127\.0\.0\.1|localhost/.test(l.url),
);
const broken = external.filter((l) => l.state === "BROKEN");
for (const l of broken) console.log(`BROKEN ${l.status ?? "-"} ${l.url} (on ${l.parent})`);
console.log(`${external.length} external links checked, ${broken.length} broken`);
process.exitCode = 0;
