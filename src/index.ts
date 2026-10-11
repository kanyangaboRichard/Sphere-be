import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app";
import  {AppDataSource}  from "./Config/database";

dotenv.config();

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected — sphere_tech_cms");
    app.listen(PORT, () => {
      console.log(`Sphere Tech API running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error(" Database connection failed:", error);
    process.exit(1);
  });
  