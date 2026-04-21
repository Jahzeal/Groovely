import { Router } from 'express';
import passport from '../config/passport';
import { 
  walletAuthController, 
  googleAuthController,
  getMeController 
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { generateToken } from '../utils/jwt';

const router = Router();

// Wallet auth
router.post('/wallet', walletAuthController);

// Simple Google auth (POST with email) - for testing
router.post('/google', googleAuthController);

// Real Google OAuth - redirects to Google
router.get('/google',
  (req, res, next) => {
    const { role } = req.query;
    if (role) {
      (req.session as any).googleRole = role;
    }
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
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

router.get('/me', authMiddleware, getMeController);

export default router;