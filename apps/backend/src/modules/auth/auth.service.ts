import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async syncUser(auth0Id: string, email: string, name?: string, avatar?: string) {
    let user = await this.usersService.findByAuth0Id(auth0Id);

    if (user) {
      // Update existing user if needed
      if (name || avatar) {
        user = await this.usersService.update(user.id, {
          ...(name && { name }),
          ...(avatar && { avatar }),
        });
      }
    } else {
      // Create new user
      user = await this.usersService.create({
        auth0Id,
        email,
        name,
        avatar,
      });
    }

    return user;
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }
}
