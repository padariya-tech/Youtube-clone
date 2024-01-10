import mongoose , {Schema}from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true //for searching in database
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true 
    },
    avatar:{
        type:String,//cloudinary url
        required:true,
        
    },
    coverImage:{
        type:String,//cloudinary url
        // required:true,
        
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"       
    }],
    password:{
        type:String,
        // use bcrypt to convert password in hash or hash your password
        required:[true,'Password is required']
    },
    refreshToken:{
        // using jwt(jsonwebtoken) library to generate tokens use jwt.io
        type:String
    }

},{timestamps:true});

// below is useful to encrypt password in hash 
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    // in above each time password was changing so instead of that we just changed only if it got modified
    this.password= await bcrypt.hash(this.password,10)
    next()
})

// above password is encrypted , so how to check it with normal password so for that we are writing methods 

userSchema.methods.isPasswordCorrect = async function (password){
    return await  bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {

        _id:this._id,
        email : this.email,
        username:this.username,
        fullName:this.fullName

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {

        _id:this._id,
       

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User",userSchema)