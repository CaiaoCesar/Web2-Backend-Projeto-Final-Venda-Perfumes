import { Router } from "express";
import { registerVendedor, loginVendedor } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerVendedor);
router.post("/login", loginVendedor);

export default router;