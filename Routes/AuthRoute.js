const express = require('express');
const { registerAdmin, loginAdmin, logoutAdmin, getAllAdmins,deleteAdmin,editAdmin,verifyPassword } = require('../Controllers/AuthController');
const verifyToken = require('../middleware/Auth');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/logout', logoutAdmin);
router.get('/admins', getAllAdmins);
router.put('/admin/edit/:id', editAdmin);
router.delete('/admin/delete/:id', deleteAdmin); 
router.post('/admin/verifypw',verifyToken,verifyPassword)


router.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Protected route accessed!', Admin: req.Admin });
});

module.exports = router;