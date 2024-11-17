import express from "express";
import { authorizedRoles, isAuthenticated } from "../middlewares/auth";
import { createLayout, editLayout, getLayoutByType } from "../Controllers/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", isAuthenticated,authorizedRoles("admin"), createLayout);

layoutRouter.put("/edit-layout", isAuthenticated,authorizedRoles("admin"), editLayout);

layoutRouter.get("/get-layout/:type",getLayoutByType);


export default layoutRouter;