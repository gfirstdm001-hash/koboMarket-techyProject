import mongoose from 'mongoose'

const refreshSessionSchema = new mongoose.Schema(
    {
        tokenHash:{
            type:String,
            required:true
        },
        isRevoked:{
            type:Boolean,
            default:false
        },
        expiresAt:{
            type:Date,
            required:true
        },
    },
        {_id:false, timestamps:true}
);


const userSchema = new mongoose.Schema(
    {
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        passwordHash:{
            type:String,
            required:true,
            minLength:8
        },
        roles: {
      type: [String],
      enum: ['buyer', 'vendor', 'admin'],
      default: ['buyer'],
    },
        isEmailVerified:{
            type:Boolean,
            default:false
        },
        emailVerifyTokenHash:{
            type:String,
            default:null
        },
        emailVerifyExpires:{
            type:Date,
            default:null
        },
        resetPasswordTokenHash:{
            type:String,
            default:null
        },
        resetPasswordExpires:{
             type:Date,
             default:null
        },
        isFrozen:{
            type: Boolean, default: false },
    refreshTokens: { type: [refreshSessionSchema], default: [] },

    vendorProfile: {
      status: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
      },
      storeName: { type: String, trim: true },
      description: { type: String, trim: true },
      bankCode: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      accountName: { type: String, trim: true },
    },
},
  {timestamps: true }
);

export const User = mongoose.model('User', userSchema);