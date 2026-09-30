import express from 'express'
import { adminLogin, adminProfile, createAppAdmin, createStudent, deleteAppAdmin, deleteStudent, getAppAdmins, getStats, getStudents, searchStudents } from '../controllers/admin.controller.js';
import { validateAdminLogin, validateCreateAdmin } from '../validators/admin.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAdmin, getAdmins, deleteAdmin } from '../controllers/admin.controller.js';
import { checkRole } from '../middlewares/checkRole.middleware.js';
import { authAdminMiddleware } from '../middlewares/authAdmin.middleware.js';
import { validateAddStudent } from '../validators/student.validator.js';
import { sendTicket } from '../controllers/ticket.controller.js';
import { validateCreateAppAdmin } from '../validators/app.admin.validator.js';

const router = express.Router();





router.post("/loginAdmin",
  validateAdminLogin,
  validate,
  adminLogin
);


router.get("/adminProfile",
  authAdminMiddleware,
  adminProfile
)


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


router.delete("/deleteAdmin",
  authAdminMiddleware,
  checkRole("superadmin"),
  deleteAdmin
);


router.post("/createStudent", 
  authAdminMiddleware,
  validateAddStudent, 
  validate,
  createStudent
);


router.get("/searchStudents",
  authAdminMiddleware,
  searchStudents
);


router.get("/getStudents",
  authAdminMiddleware,
  getStudents
);


router.delete("/deleteStudent",
  authAdminMiddleware,
  checkRole("admin", "superadmin"),
  deleteStudent
);

router.patch('/send-ticket', 
  authAdminMiddleware,
  checkRole("superadmin", "admin"),
  sendTicket
);


router.post("/createAppAdmin",
  authAdminMiddleware,
  checkRole("superadmin"),
  validateCreateAppAdmin,
  validate,
  createAppAdmin
);


router.get("/getAppAdmins",
  authAdminMiddleware,
  checkRole("superadmin"),
  getAppAdmins
);


router.delete("/deleteAppAdmin",
  authAdminMiddleware,
  checkRole("superadmin"),
  deleteAppAdmin
);


router.get("/stats",
  authAdminMiddleware,
  checkRole("superadmin"),
  getStats
);



export default router;