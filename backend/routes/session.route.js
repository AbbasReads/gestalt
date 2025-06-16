import express from 'express'
import { upload } from '../middlewares/multer.middleware.js';
import { uploadFile } from '../controllers/session.controller.js';
const sessionRouter=express.Router();

sessionRouter.route('/upload-file').post(upload.single("file"),uploadFile)

export {sessionRouter}