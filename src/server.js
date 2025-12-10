import express from "express"
import dotenv from "dotenv"
import path from "path"
import { ENV } from "./lib/env.js"

dotenv.config();

const app = express();

const __dirname = path.resolve()



app.get("/health", (req , res) => {
    res.status(200).json({msg: "api is running"})
});


app.get("/book", (req , res) => {
    res.status(200).json({msg: "this is the books endpoint"})
});

// make our app ready for deployment
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../client/dist")))

    app.get("/{*any)", (req,res) => {
        res.sendFile(path.join(__dirname,"../client", "dist", "index.html"));
    })

}

app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT))
