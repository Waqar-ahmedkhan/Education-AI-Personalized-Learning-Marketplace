import express from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { createOrder } from '../Controllers/Order.controller';

 const orderRoute = express.Router();


orderRoute.post("/create-order", isAuthenticated, createOrder)


export default orderRoute;