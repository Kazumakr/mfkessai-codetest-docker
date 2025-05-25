import {
  Injectable,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private usersRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['apikey'];
    const userId = Number(request.body.user_id);

    if (!apiKey || !userId) {
      throw new UnauthorizedException('API key and user ID are required');
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    //dbに登録されているapiKeyと一致するかvalidate
    if (apiKey !== user.api_key) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
