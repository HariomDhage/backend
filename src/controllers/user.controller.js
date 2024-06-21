import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { application } from "express";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from "../models/user_model.js";
import mongoose, { Aggregate } from "mongoose";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};


const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from respose
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
 // console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fileds are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "user with this email and username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const converImageLocalPath = req.files?.coverImage[0]?.path;

  let converImageLocalPath;

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
    converImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(converImageLocalPath);

   
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regestering user ");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registerd successfully"));

  //  if (fullName === "") {
  //     throw new ApiError(400, "fullname is requaried!!")
  //  }
})


const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email se validate
  // find  the user in db
  // check password
  // access and refresh token provide to user
  // send cookie
  // return res

  const { email,username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "username or email is required")
  }

  //here if we want altrenative apporoach then
  //  if (!(email || username)) {
  //    throw new ApiError(400, "username or email is required");
  //  }

  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if (!user) {
    throw new ApiError(400, "user does not exist")
  }

  const isPasswordValid =await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401,"invalid user credentials!!")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUsser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUsser, accessToken, refreshToken
      },
      "User logged In Successfully"
    )
  )


})


const logoutUser = asyncHandler(async(req,res) => {
  User.findByIdAndUpdate(
    req.user._id, 
    {
      $set:{
        refreshToken: undefined
      }

    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {} , "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{

 const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

 if (!incomingRefreshToken) {

  throw new ApiError(401,"unauthorise access")
 }

 try {
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
  const user = User.findById(decodedToken?._id)
 
  if (!user) {
    throw new ApiError(401, "invalid refresh token");
  }
 
  if (incomingRefreshToken !== user?.refreshToken) {
   throw new ApiError(401, "refresh token expaired");
  
  }
 
  const options = {
   httpOnly: true ,
   secure:true
  }
 
 const {accessToken, newRefreshToken} =await generateAccessAndRefereshTokens(user?._id)
 
 return res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",newRefreshToken,options)
 .json(
   
     new ApiResponse(
       200,
       {accessToken,
         refreshToken: newRefreshToken},
         "access token refreshed successfully"
       
     )
   
 )
 } catch (error) {
  throw new ApiError(401, error?.message || "Invalid refresh token")
 }
})

const changeCurrentPassword = asyncHandler(async(req,res) =>{
  const {oldPassword , newPassword} = req.body

  const user =await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError (400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) =>{
  return res
  .status(200)
  .json(ApiResponse(200,res.user,"Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res) =>{
  const {userName, email} = req.body

  if (!userName || !email) {
    throw new ApiError(400,"All fields are required")
   }

   const user = User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        fullName,
        email:email
      }
    },
    {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if (!avatar) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url       
      },
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image got updated"));

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, user, "Avatar got updated"));
})

const getUserChannelProfile = asyncHandler(async(req,res) =>{
  const {username}= req.params

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing")
  }

  const channel = await Aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "Subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed:{
          $cond:{
            if:{$in: [req.user?._id, "$subscribers.Subscriber"]},
            then: true,
            else: flase
          }
        }
      }
    },
    {
      $project:{
        fullName:1,
        username:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email:1
      }
    }
  ])

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
  }

  return res
  .status(200)
  .json(new ApiResponse(200,channel[0],"User channel fectched succcessfully"))


})



export { registerUser, loginUser, logoutUser, refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails
  ,updateUserAvatar,updateUserCoverImage
 };
