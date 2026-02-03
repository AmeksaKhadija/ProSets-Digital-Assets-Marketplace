import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  email?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
  aud?: string[];
  iss?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: audience,
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    // Find or create user in database
    let user = await this.usersService.findByAuth0Id(payload.sub);

    if (!user && payload.email) {
      // First-time login: create user
      user = await this.usersService.create({
        auth0Id: payload.sub,
        email: payload.email,
      });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      auth0Id: user.auth0Id,
      email: user.email,
      role: user.role,
      permissions: payload.permissions || [],
    };
  }
}
