const express = require("express");
const router = express.Router();
const { userRegister,userLogin,forgotPassword,resetPassword,mailVerification} = require("../Controllers/UserController");


router.post("/register", userRegister);
router.post("/",userLogin);
router.post("/forgotpassword",forgotPassword);
router.get("/mailVerfication",mailVerification);
router.post("/resetpassword",resetPassword);

module.exports = router;
