import {asyncHandler} from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import {apiError} from "../utils/apiError.js";
import { User} from "../models/user.models.js"








const registerUser = asyncHandler(async(req,res)=>{
    const {
        username,
        email,
        password,
        firstName,
        lastName,
        bio,
        profilePicture
    } = req.body;
    
    //Database validation
    if (!username || !email || !password) {
        throw new apiError(400, 'All fields are required');
      }

    //Checking if the user already exists?

    const existingUser = await User.findOne({ $or: [{ email, username }] });
    if (existingUser) {
      throw new apiError(
        400,
        'User with the same email or username already exists'
      );
    }


    //Inserting it into database and saving it
    const user = new User({
        username: username.toLowerCase(),
        email,
        password,
        firstName,
        lastName,
        bio,
        profilePicture,
      });

     await user.save();


     //checking the errors while saving errors
     const createdUser = await User.findById(user._id).select('-password');

     if(!createdUser){
        throw new apiError(500,"Something went wrong while registering the user!");
     }

     res
     .status(200)
     .json(new apiResponse(200,createdUser,"User registered successfully!"));



})


const loginUser = asyncHandler()









export {
    registerUser
}