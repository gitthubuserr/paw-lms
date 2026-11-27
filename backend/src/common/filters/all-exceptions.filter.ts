import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

/**
 * Format error seragam untuk seluruh API:
 * { success:false, statusCode, message, errors? }
 * Frontend cukup satu cara membaca error dari semua modul.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    let status = 500;
    let message = 'Terjadi kesalahan pada server';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const msg = (body as { message?: string | string[] }).message;
        if (Array.isArray(msg)) {
          errors = msg;
          message = 'Data yang dikirim tidak valid';
        } else if (msg) {
          message = msg;
        }
      }
      if (status === 429) message = 'Terlalu banyak percobaan. Coba lagi sebentar lagi.';
    } else {
      // Error tak terduga: detail hanya ke log server, tidak ke klien.
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    res.status(status).json({ success: false, statusCode: status, message, errors });
  }
}
