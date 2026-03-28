import { test as setup } from "@playwright/test";
import { execSync } from "child_process";

setup("seed base test data", async () => {
  console.log("Seeding base test data...");
  execSync("npm run seed:test:prod", {
    stdio: "inherit",
    cwd: process.cwd(),
    timeout: 60000,
  });
  console.log("Base test data seeded.");
});
