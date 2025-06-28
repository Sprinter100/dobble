import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';

interface RegisterDto {
  username: string;
  password: string;
}

interface LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const { username, password } = registerDto;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const result = await this.authService.register(username, password);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { username, password } = loginDto;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const result = await this.authService.login(username, password);

    if (result.success && result.user?.id && result.user?.username) {
      // Create session
      const sessionId = req.sessionID || `temp_${Date.now()}`;
      this.authService.createSession(
        sessionId,
        result.user.id,
        result.user.username,
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
      });
    } else {
      return res.status(401).json(result);
    }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    if (req.sessionID) {
      this.authService.removeSession(req.sessionID);
    }

    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: 'Error logging out' });
      }
      res.clearCookie('connect.sid');
      return res
        .status(200)
        .json({ success: true, message: 'Logout successful' });
    });
  }

  @Get('me')
  getCurrentUser(@Req() req: Request, @Res() res: Response) {
    if (!req.sessionID) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated' });
    }

    const session = this.authService.getSession(req.sessionID);

    if (!session) {
      return res
        .status(401)
        .json({ success: false, message: 'Session not found' });
    }

    const user = this.authService.getUserById(session.userId);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  }
}
