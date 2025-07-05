import express from 'express';
import { isAdmin, isAuthenticated } from '../middlewares/auth';
import { getNotification, updateNotification } from '../Controllers/notification.controller';

const notificationRoute = express.Router();


notificationRoute.get("/get-all-notifications", isAuthenticated, isAdmin, getNotification)
notificationRoute.put("/update-notification/:id", isAuthenticated, isAdmin, updateNotification);



export default notificationRoute;


