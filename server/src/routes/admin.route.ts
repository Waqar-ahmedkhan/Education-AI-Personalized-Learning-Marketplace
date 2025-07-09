import express from 'express';
import {
  adminLogin,
  createAdmin,
  createInitialAdmin,
  deleteUser,
  getAdminInfo,
  getallUsers,
  updateUserRoles,
} from '../Controllers/user.controller';
import { isAuthenticated, isAdmin } from '../middlewares/auth';

const AdminRoute = express.Router();

// Public admin route (initial setup)
AdminRoute.post('/admin/setup-initial-admin', createInitialAdmin);

// Protected admin routes
AdminRoute.post('/admin/login', adminLogin); // Reuse UserLogin with admin check
AdminRoute.get('/admin/users', isAuthenticated, isAdmin, getallUsers);
AdminRoute.put('/admin/update-user-role', isAuthenticated, isAdmin, updateUserRoles);
AdminRoute.delete('/admin/user-delete/:id', isAuthenticated, isAdmin, deleteUser);
AdminRoute.post('/admin/create-admin', isAuthenticated, isAdmin, createAdmin);
AdminRoute.get('/admin/me', isAuthenticated, isAdmin, getAdminInfo);

export default AdminRoute;