import { AppService } from './app.service';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getIndex(@Req() req: Request, @Res() res: Response) {
    const cookieName = 'device_id';
    let deviceId = req.cookies?.[cookieName] as string;

    if (!deviceId) {
      deviceId = uuidv4(); // Generate a unique ID
      res.cookie(cookieName, deviceId, {
        httpOnly: true, // Not accessible from JS
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
      });
    }

    res.sendFile('index.html', { root: 'public' });
  }
}
