import express from 'express';
import { authorizedRoles, isAuthenticated } from '../middlewares/auth';
import { createOrder, getAllOrders } from '../Controllers/Order.controller';

 const orderRoute = express.Router();


orderRoute.post("/create-order", isAuthenticated, createOrder)
orderRoute.post("/get-orders", isAuthenticated, authorizedRoles("admin"), getAllOrders)


export default orderRoute;