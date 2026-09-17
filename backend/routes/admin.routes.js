import express from 'express'
import { adminLogin, createStudent, getStudents, searchStudents } from '../controllers/admin.controller.js';
import { validateAdminLogin, validateCreateAdmin } from '../validators/admin.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAdmin, getAdmins, deleteAdmin } from '../controllers/admin.controller.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';
import { authAdminMiddleware } from '../middlewares/authAdmin.middleware.js';
import { validateAddStudent } from '../validators/student.validator.js';


const router = express.Router();




// Admin Login
router.post("/loginAdmin",
  validateAdminLogin,
  validate,
  adminLogin
);


router.post("/createAdmin",
  authAdminMiddleware,
  checkRole("superadmin"),
  validateCreateAdmin,
  validate,
  createAdmin
);

router.get("/getAdmins",
  authAdminMiddleware,
  checkRole("superadmin"),
  getAdmins
);


router.delete("/deleteAdmin/:id",
  authAdminMiddleware,
  checkRole("superadmin"),
  deleteAdmin
);


router.post("/createStudent", 
  authAdminMiddleware,
  validateAddStudent, 
  validate,
  createStudent
)


router.get("/searchStudents",
  authAdminMiddleware,
  searchStudents
)


router.get("/getStudents",
  authAdminMiddleware,
  getStudents
)



// router.post(
//   "/upload-excel",
//   authAdminMiddleware,
//   checkRole("superadmin", "admin"),
//   upload.single("file"),
//   registerStudentsFromExcel
// );


export default router;