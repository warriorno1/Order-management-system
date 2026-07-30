import express from "express";
import validateOrder from "../middleware/validateOrder.js";
import {createOrder,getOrders,getOrderById} from "../controllers/orders.controller.js";

const router = express.Router();

router.post('/', validateOrder, createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;