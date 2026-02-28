// D:\Projects\Talvo\Talvo-Backend\src\middleware\protectRoute.js
import { requireAuth } from '@clerk/express'
import User from '../models/User.js'

export const protectRoute = [
    requireAuth(),
    async (req,res, next) => {
        try {   
            const clerkId = req.auth().userId;
            console.log("[protectRoute] Incoming clerkId:", clerkId);

            if(!clerkId){
                console.log("[protectRoute] No clerkId → 401");
                return res.status(401).json({msg:"Unauthorized - invalid token"})
            }
                

            const user = await User.findOne({clerkId})
            console.log("[protectRoute] Found user:", user ? user._id : "NOT FOUND");

            if(!user) return res.status(404).json({msg:"User not found"})
                
                req.user = user
            next()

        } catch (error) {
            console.error("Error in protectRoute middleware",error)
            res.status(500).json({message:"Internal Server Error"})
        }
    }
]