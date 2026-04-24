import { Router } from 'express';
import passport from '../config/passport';
import { 
  walletSignup,
  googleSignup,
  walletLogin,
  googleLogin,
  getMeController 
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { generateToken } from '../utils/jwt';

const router = Router();

// ============================================
// SIGNUP (Create new account)
// ============================================
router.post('/signup/wallet', walletSignup);
router.post('/signup/google', googleSignup);

// ============================================
// LOGIN (Existing account only)
// ============================================
router.post('/login/wallet', walletLogin);
router.post('/login/google', googleLogin);

// ============================================
// GOOGLE OAUTH (Redirect flows)
// ============================================
router.get('/google',
  (req, res, next) => {
    const { role, prompt } = req.query;
    if (role) {
      (req.session as any).googleRole = role;
    }
    if (prompt) {
      (req.session as any).googlePrompt = prompt;
    }
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const role = (req.session as any)?.googleRole || 'fan';
      
      const token = generateToken(user.id, role, user.wallet, user.email);
      
      const userResponse = {
        id: user.id,
        wallet: user.wallet,
        email: user.email,
        role: role,
        createdAt: user.created_at,
      };
      
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth?error=google_auth_failed`);
    }
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ success: false, error: 'Google authentication failed' });
});

// ============================================
// GET CURRENT USER
// ============================================
router.get('/me', authMiddleware, getMeController);

export default router;