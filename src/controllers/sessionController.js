import { chatClient, streamClient } from "../lib/stream.js"
import Session from "../models/Session.js"

export async function createSession(req,res) {
    try {
        const {problem, difficulty} = req.body
        const userId = req.user._id
        const clerkId = req.user.clerkId

        if(!problem || !difficulty) {
            return res.status(400).json({message:"Problem and difficulty are required"})
        }

        // generate a unique call id for stream video
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`

        // create session in db
        const session = await Session.create(
            { problem, difficulty, host: userId, callId}
        )

        //create stream video call
        await streamClient.video.call("default",callId).getOrCreate({
            data:{
                created_by_id:clerkId,
                custom: { problem, difficulty, sessionId: session._id.toString() },
            },
        });

        // chat messaging
        const channel = chatClient.channel("messaging",callId, {
            name:`${problem} Session`,
            created_by_id:clerkId,
            members:[clerkId]
        })
        await channel.create()
        res.status(201).json({session})
    } catch (error) {
        console.log("Error in createSession controller:", error.message);     
        res.status(500).json({message: "Internal server error"})
    }
}

export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({ status: "active" })
        .populate("host", "name profileImage email clerId")
        .sort({ createAt: -1 })
        .limit(20);

        res.status(200).json({sessions})
    } catch (error) {
        console.log("Error in getActiveSessions controller:", error.message);
        res.status(500).json({ message: "Internal Server Error"});
    }
}

export async function getMyRewcentSessions(req,res) {
    try {
        const userId = req.user._id

        //get sessions where user is either host or participant
        const sessions = await Session.find({
            status:"completed",
            $or: [{host:userId}, {participant:userId}]
        })
        .sort({ createAt: -1 })
        .limit(20);

        res.status(200).json({sessions});
    } catch (error) {
        console.log("Error in getActiveSessions controller:", error.message);
        res.status(500).json({ message: "Internal Server Error"});    }
}

export async function getSessionById(req,res) {
    try {
        const {id} = req.params
        const session = await Session.findById(id)
        .populate("host","name email profileImage clerkId")
        .populate("participant", "name email profileImage clerkId")

        if(!session) return res.status(404).json({message:"Session not found"})

        res.status(200).json({session})
    } catch (error) {
        console.log("Error in getActiveSessions controller:", error.message);
        res.status(500).json({ message: "Internal Server Error"});
    }
}

export async function joinSession(req,res) {}

export async function endSession(req,res) {}