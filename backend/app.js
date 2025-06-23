import express from "express";
import {sessionRouter} from './routes/session.route.js'
import cors from "cors"
const app=express();
app.use(cors({
    origin: [
  /^http:\/\/localhost:\d+$/, // allows http://localhost:PORT (any port)
  "https://gestalt-ashy.vercel.app" // exact match only
]

}))
// const router=express.Router();

app.use('/api/v1/session', sessionRouter)
export {app}