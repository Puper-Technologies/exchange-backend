import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * this is the custom decorator that can be used to access the authenticated  user in the route handler parameter
 */
const AuthenticatedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest();
    return user;
  },
);

export default AuthenticatedUser;
