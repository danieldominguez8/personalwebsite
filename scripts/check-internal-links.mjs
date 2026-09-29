import { LinkChecker } from "linkinator";

const checker = new LinkChecker();
const result = await checker.check({
  path: "dist",
  recurse: true,
  linksToSkip: async (link) => !/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(link),
});
const broken = result.links.filter((l) => l.state === "BROKEN");
for (const l of broken) console.log(`BROKEN ${l.status ?? "-"} ${l.url} (on ${l.parent})`);
console.log(`${result.links.length} internal links checked, ${broken.length} broken`);
process.exitCode = broken.length > 0 ? 1 : 0;
