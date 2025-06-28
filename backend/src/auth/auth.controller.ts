import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService, User } from './auth.service';
import { LocalStrategy } from './passport.strategy';
import { AuthenticatedGuard, NotAuthenticatedGuard } from './auth.guard';

interface RegisterDto {
  username: string;
  password: string;
}

interface LoginDto {
  username: string;
  password: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly localStrategy: LocalStrategy,
  ) {}

  @Post('register')
  @UseGuards(NotAuthenticatedGuard)
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
  @UseGuards(NotAuthenticatedGuard)
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Req() req: AuthenticatedRequest,
  ) {
    const { username, password } = loginDto;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    try {
      // Use Passport strategy to validate credentials
      const user = await this.localStrategy.validate(username, password);

      if (user) {
        // Log in the user with Passport
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Login failed',
            });
          }

          return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
              id: user.id,
              username: user.username,
              createdAt: user.createdAt,
            },
          });
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    req.logout((err) => {
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
  @UseGuards(AuthenticatedGuard)
  getCurrentUser(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const user = req.user;

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
