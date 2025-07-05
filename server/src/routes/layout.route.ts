import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth";
import { createLayout, editLayout, getLayoutByType } from "../Controllers/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", isAuthenticated,isAdmin, createLayout);

layoutRouter.put("/edit-layout", isAuthenticated, isAdmin, editLayout);

layoutRouter.get("/get-layout/:type",getLayoutByType);


export default layoutRouter;