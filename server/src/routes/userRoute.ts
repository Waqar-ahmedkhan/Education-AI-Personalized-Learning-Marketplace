import express from "express";
import { registerUser } from "../Controllers/user.controller";

const route = express.Router();


route.post('/registration', registerUser)


export default route;
