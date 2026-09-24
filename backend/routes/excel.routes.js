import express from 'express';
import { authAdminMiddleware } from '../middlewares/authAdmin.middleware.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';
import { uploadExcel } from '../controllers/excel.controller.js';
import uploadMiddleware from '../middlewares/upload.middleware.js';

const router = express.Router();



router.post('/uploadExcel', 
    authAdminMiddleware, 
    checkRole("superadmin"),
    uploadMiddleware.single("file"),
    uploadExcel
)



export default router;