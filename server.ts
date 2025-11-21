import express from "express";
import router from "./Routes/userRoute.ts";
import searchroute from "./Routes/searchRoute.ts";
import dotenv from "dotenv";
import { seed } from "./seed.ts";
import db from "./Config/db.ts";
import rolerouter from "./Routes/roleRoute.ts";
import cors from "cors";
import audit from "./Routes/auditRoute.ts";
import email from "./Routes/emailRoute.ts";
import cms from "./Routes/cmsRoute.ts";
import faq from "./Routes/faqRoute.ts";
import applicationconfig from "./Routes/applicationconfigRoute.ts";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import permissionrouter from "./Routes/permissionRoute.ts";

dotenv.config();
const app = express();
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/upload",
  (req, res, next) => {
    console.log("Static file request:", req.url); // log requested path
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "upload"))
);

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

(async () => {
  try {
    await db.raw("select 1+1 as result"); // await the DB connection
    console.log("Database connected successfully");

    // await db('roleuser').sync({ alter: true }); // Sync User model with DB
    // console.log("User model synced");

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

console.log("Serving files from:", path.join(__dirname, "upload"));

const uploadPath = path.join(__dirname, "upload");
console.log("Files in upload folder:", fs.readdirSync(uploadPath));

app.get("/check-upload", (req, res) => {
  const uploadPath = path.join(__dirname, "upload");
  console.log("Checking upload path:", uploadPath);

  if (fs.existsSync(uploadPath)) {
    const files = fs.readdirSync(uploadPath);
    res.json({ message: "Upload folder found ✅", files });
  } else {
    res.status(404).json({ message: "Upload folder not found❌" });
  }
});

app.get("/test", (req: any, res: any) => {
  try {
    console.log("welcome to tes");
    res.send("Welcome to you in role based login signup...");
  } catch (errr) {
    console.log("n catch---", errr);
  }
});


app.use("/", router);
app.use("/", searchroute);
app.use("/", rolerouter);
app.use("/", audit);
app.use("/", email);
app.use("/", cms);
app.use("/", faq);
app.use("/", applicationconfig);
app.use("/", permissionrouter);

const PORT = 4041;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
