import {asyncHandler} from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import {apiError} from "../utils/apiError.js";
import { User} from "../models/user.models.js"


const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId);
      
      const accessToken =await user.generateAccessToken();
      const refreshToken =await user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return {accessToken, refreshToken};


  } catch (error) {
      throw new apiError(500, "Something went wrong while generating referesh and access token");
  }
}




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


const loginUser = asyncHandler(async (req, res) =>{


  const {email, username, password} = req.body
  console.log(email);

  if (!username && !email) {
      throw new apiError(400, "username or email is required")
  }
  
  

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new apiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new apiError(401, "Invalid user credentials")
  }

 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new apiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(200, {}, "User logged Out"))
})






export {
    registerUser,
    loginUser,
    logoutUser
}