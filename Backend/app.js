
import express from "express";
import orderRoute from "./routes/order.route.js";
import errorHandler from "./errorHandler/errorHandler.js";



const app = express();




app.use(express.json());
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/order",orderRoute);

app.use(errorHandler);
export default app;


