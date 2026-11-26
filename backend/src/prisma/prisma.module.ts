import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Global: modul lain (classes, materials, dst.) cukup inject PrismaService tanpa import module. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
