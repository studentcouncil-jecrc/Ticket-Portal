import express from "express";
import { allowEntry, appAdminLogin, scanTicket } from "../controllers/app.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateAppAdminLogin } from "../validators/app.admin.validator.js";
import { authAppAdminMiddleware } from "../middlewares/app.auth.middleware.js";
import { appAdminLogout } from "../controllers/app.controller.js";

const router = express.Router();



router.post("/appLogin",
  validateAppAdminLogin,
  validate,
  appAdminLogin
);


router.post("/appLogout",
  authAppAdminMiddleware,
  appAdminLogout
);


router.post("/scan-ticket",
  authAppAdminMiddleware,
  scanTicket
);


router.post("/allow-entry",
  authAppAdminMiddleware,
  allowEntry
);



export default router;