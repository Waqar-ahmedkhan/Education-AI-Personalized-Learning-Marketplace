import express from 'express';
import { isAdmin, isAuthenticated } from '../middlewares/auth';
import { createOrder, getAllOrders } from '../Controllers/Order.controller';

 const orderRoute = express.Router();


orderRoute.post("/create-order", isAuthenticated, createOrder)
orderRoute.post("/get-orders",isAuthenticated, isAdmin, getAllOrders)


export default orderRoute;