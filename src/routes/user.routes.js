import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { registerUser,loginUser,logoutUser } from "../controllers/user.controllers.js";
const userRouter = Router();



userRouter
.route("/register")
.post(registerUser);


userRouter
.route("/login")
.post(loginUser);


userRouter
.route("/logout")
.post(verifyJWT,logoutUser);






export {userRouter};