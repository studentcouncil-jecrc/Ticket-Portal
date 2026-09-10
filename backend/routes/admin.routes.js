import express from 'express'
import { adminLogin } from '../controllers/admin.controller.js';
import { validateAdminLogin, validateCreateAdmin } from '../validators/admin.validator.js';
import { validateAdmin } from '../middlewares/validate.middleware.js';
import { createAdmin, getAdmins, deleteAdmin } from '../controllers/admin.controller.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';
import { authAdminMiddleware } from '../middlewares/authAdmin.middleware.js';


const router = express.Router();




// Admin Login
router.post(
  "/loginAdmin",
  validateAdminLogin,
  validateAdmin,
  adminLogin
);


router.post(
  "/createAdmin",
  authAdminMiddleware,
  checkRole("superadmin"),
  validateAdmin,
  validateCreateAdmin,
  createAdmin
);

router.get(
  "/getAdmins",
  authAdminMiddleware,
  checkRole("superadmin"),
  getAdmins
);


router.delete(
  "/deleteAdmin/:id",
  authAdminMiddleware,
  checkRole("superadmin"),
  deleteAdmin
);


// router.post(
//   "/upload-excel",
//   authAdminMiddleware,
//   checkRole("superadmin", "admin"),
//   upload.single("file"),
//   registerStudentsFromExcel
// );


export default router;