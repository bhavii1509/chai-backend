import {asyncHandler} from "../utils/asyncHandler.js"
import{ ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler( async (req,res) => {
    //get the user details from frontend
    //validation - not empty
    //check if user already present in db: username, email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    //get the user details from frontend
    const {fullName, email, username, password} = req.body
    console.log("email: ", email)

    //validation - not empty
    if (
        [fullName, username, email, password].some((field)=>field?.trime() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user already present in db: username, email
    const existedUser = User.findOne({
        $or: [{email}, {username}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already existed")
    }

    //check for images, check for avatar

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    //upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPathLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    //create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        password,
        email,
        username: username.toLowerCase()
    })


    //check for user creation
    //remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    
    //return response

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered successfully")
    )

})

export { registerUser }