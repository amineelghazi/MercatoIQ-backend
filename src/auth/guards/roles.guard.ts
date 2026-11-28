import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "../../users/constants/user-roles.constant";
import { AuthenticatedUser } from "../auth.types";
import { isAdminController } from "./admin-route.util";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const hasRoles = !!roles && roles.length > 0;

    if (
      (!hasRoles) && !isAdminController(context.getClass())
    ) {
      return true;
    }

    const required = hasRoles ? roles : ["admin"];

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user) throw new UnauthorizedException("No user");

    if (!required.includes(user.role))
      throw new ForbiddenException("Wrong role");

    return true;
  }
}
