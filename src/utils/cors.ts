import cors from "cors";

/**
 * Option for cross origin resource sharing (CORS)
 * by default the browser blocks each call from different domain
 * Whiteout CROS a client hosted on localhost:3000 can not access localhost:8080 via browser
 */
export const options: cors.CorsOptions = {
  optionsSuccessStatus: 200,
  origin: ["http://localhost:3000"],
  credentials: true,
  methods: "GET, POST, PUT, PATCH, DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};
