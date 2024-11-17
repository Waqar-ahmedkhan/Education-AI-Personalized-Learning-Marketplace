import express from 'express';
import { authorizedRoles, isAuthenticated } from '../middlewares/auth';
import { getNotification, updateNotification } from '../Controllers/notification.controller';

const notificationRoute = express.Router();


notificationRoute.get("/get-all-notifications", isAuthenticated, authorizedRoles("admin"), getNotification)
notificationRoute.put("/update-notification/:id", isAuthenticated, authorizedRoles("admin"), updateNotification);


export default notificationRoute;


