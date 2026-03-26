import app from "./app";
import { envVars } from "./app/config/env";
import { seedAdmin } from "./app/utils/seed";

const bootstrap = async () => {
  try {
    
    if (process.env.NODE_ENV !== "production") {
      await seedAdmin();
    }
    app.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

bootstrap();
