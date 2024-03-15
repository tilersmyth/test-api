import {
  NestMiddleware,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const env = this.configService.get<string>('NODE_ENV');

    if (env === 'development') {
      return next();
    }

    const apiKey = this.configService.get<string>('API_KEY');

    if (apiKey !== req.headers['x-api-key']) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return next();
  }
}
