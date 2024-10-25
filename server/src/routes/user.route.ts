import express from "express";
import { registerUser } from "../Controllers/user.controller";

const UserRoute = express.Router();


UserRoute.post('/registration', registerUser)


export default UserRoute;
