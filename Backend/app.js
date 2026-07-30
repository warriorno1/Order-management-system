
import express from "express";
import orderRoute from "./routes/order.route.js";
import errorHandler from "./errorHandler/errorHandler.js";
import schedulerRoute from "./routes/scheduler.route.js";
import cors from 'cors';





const app = express();




app.use(express.json());
app.use(cors());
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/order",orderRoute);
app.use("/api/scheduler", schedulerRoute);

app.use(errorHandler);
export default app;


