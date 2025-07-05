import express from "express"
import { isAdmin, isAuthenticated } from "../middlewares/auth";
import { getCoursesAnalytics, getOrderAnalytics, getUsersAnalytics } from "../Controllers/analytics.controller";

const analyticsRouter = express.Router();


analyticsRouter.get("/get-users-analytics", isAuthenticated , isAdmin, getUsersAnalytics);

analyticsRouter.get("/get-orders-analytics", isAuthenticated,isAdmin, getOrderAnalytics);



analyticsRouter.get("/get-courses-analytics", isAuthenticated,isAdmin, getCoursesAnalytics);

export default analyticsRouter;