import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUser } from '../user';

/** Ambil user yang sedang login. Contoh: findMine(@CurrentUser() user: SafeUser) */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): SafeUser => {
  return ctx.switchToHttp().getRequest().user;
});
