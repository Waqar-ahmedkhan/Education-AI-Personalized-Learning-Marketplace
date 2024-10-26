import express from "express";
import { activateUser, registerUser } from "../Controllers/user.controller";

const UserRoute = express.Router();


UserRoute.post('/registration', registerUser)
UserRoute.post('/active-user', activateUser)


export default UserRoute;
