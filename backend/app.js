import express from "express";
import {sessionRouter} from './routes/session.route.js'
const app=express();

// const router=express.Router();

app.use('/api/v1/session', sessionRouter)
// app.use()
export {app}