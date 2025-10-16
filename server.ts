import express from "express";
import type { Request, Response } from "express";
import { connectionDB } from "./Config/db.ts";
import router from "./Routes/userRoute.ts";
import searchroute from "./Routes/searchRoute.ts"
import dotenv from "dotenv";
import { seed } from "./seed.ts";
import "./Model/Association/index.ts";
import { User } from "./Model/userModel.ts";



dotenv.config();
const app = express();
app.use(express.json());


(async () => {
  try {
    await connectionDB(); // await the DB connection
    console.log("Database connected successfully");

    await User.sync({ alter: true }); // Sync User model with DB
    console.log("User model synced");

    await seed(); // seed roles & permissions
    console.log("Seeding completed");
  } catch (error) {
    console.error("Error during DB connection, syncing, or seeding:", error);
  }
})();

// app.get("/test", (req: Request, res: Response) => {
//   console.log("heyyyy");
//   res.json({ message: "heyyyyy" });
// });

app.get("/test", (req: any, res: any) => {
  try {
    console.log("welcome to tes");
    res.send("Welcome to you in role based login signup...");
  } catch (errr) {
    console.log("n catch---", errr);
  }
});

app.use("/", router);
app.use("/",searchroute);

const PORT = 4040;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
