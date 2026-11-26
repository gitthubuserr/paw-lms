import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

/**
 * Bungkus semua respons sukses: { success:true, data, meta? }
 * Service yang mengembalikan { items, meta } otomatis menjadi data=items + meta.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'items' in result && 'meta' in result) {
          const { items, meta } = result as { items: unknown; meta: unknown };
          return { success: true, data: items, meta };
        }
        return { success: true, data: result ?? null };
      }),
    );
  }
}
