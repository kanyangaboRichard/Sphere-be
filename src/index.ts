import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./Config/database";
import { S3Service } from "./Modules/Services/s3.services";

dotenv.config();

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected — sphere_tech_cms");

    const s3Service = new S3Service();
    await s3Service.ensurePublicBucket();
    console.log("S3 bucket ready and public");

    app.listen(PORT, () => {
      console.log(`Sphere Tech API running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error("Startup failed:", error);
    process.exit(1);
  });