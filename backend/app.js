import express from "express";
import {sessionRouter} from './routes/session.route.js'
import cors from "cors"
const app=express();
app.use(cors({
    origin:["http://localhost:*","https://gestalt-ashy.vercel.app/*"]
}))
// const router=express.Router();

app.use('/api/v1/session', sessionRouter)
// app.use()
export {app}