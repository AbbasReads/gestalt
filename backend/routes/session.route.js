import express from 'express'
import {createSession } from '../controllers/session.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { uploadFile } from '../controllers/session.controller.js';
const sessionRouter=express.Router();

sessionRouter.route('/create-session').post(createSession)  //To be post, not get
sessionRouter.route('/upload-file').post(upload.single("file"),uploadFile)
// sessionRouter.route('/delete-session',deleteSession)
// sessionRouter.route('/join-session').post(joinUser)
export {sessionRouter}