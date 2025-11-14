import { Hono } from "hono";
import { db } from "./db/db";
import { users } from "./db/schema/users";

const app = new Hono();

const welcomeStrings = [
  `Hello Hono from Bun ${process.versions.bun}!`,
  "To learn more about Hono + Bun on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

app.get("/about", (c) => {
  return c.text('Anjaye')
})

app.get("/users", async (c) => {
  try {
    // 1. Fetch all rows from the 'users' table using Drizzle's type-safe select
    const allUsers = await db.select().from(users);

    // 2. Return the data as a JSON response
    return c.json({ 
      success: true,
      data: allUsers 
    }, 200);

  } catch (error) {
    console.error("Error fetching users:", error);
    // 3. Return a 500 internal server error on failure
    return c.json({ 
      success: false, 
      message: "Failed to fetch users" 
    }, 500);
  }
});

export default app;
