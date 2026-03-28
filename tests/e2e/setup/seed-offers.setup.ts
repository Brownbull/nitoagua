import { test as setup } from "@playwright/test";
import { execSync } from "child_process";

setup("seed offer test data", async () => {
  console.log("Seeding offer test data...");
  execSync("npm run seed:offers:prod", {
    stdio: "inherit",
    cwd: process.cwd(),
    timeout: 60000,
  });
  console.log("Offer test data seeded.");
});
