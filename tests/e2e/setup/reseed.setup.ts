import { test as setup } from "@playwright/test";
import { execSync } from "child_process";

setup("re-seed before mutating tests", async () => {
  console.log("Re-seeding test + offer data for mutating tests...");
  execSync("npm run seed:test:prod", {
    stdio: "inherit",
    cwd: process.cwd(),
    timeout: 60000,
  });
  execSync("npm run seed:offers:prod", {
    stdio: "inherit",
    cwd: process.cwd(),
    timeout: 60000,
  });
  console.log("Re-seed complete.");
});
