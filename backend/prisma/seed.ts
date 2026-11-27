import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const ROUNDS = 12;

async function upsertUser(params: {
  name: string;
  email: string;
  password: string;
  role: Role;
  identityNumber?: string;
}) {
  const password = await bcrypt.hash(params.password, ROUNDS);
  return prisma.user.upsert({
    where: { email: params.email },
    // update kosong: seed aman dijalankan berulang tanpa menimpa data yang sudah diubah
    update: {},
    create: { ...params, password },
  });
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@lms.test';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin12345';

  await upsertUser({ name: 'Administrator', email: adminEmail, password: adminPassword, role: Role.ADMIN });
  console.log(`Admin siap: ${adminEmail}`);

  // Akun demo hanya dibuat di luar production.
  if (process.env.NODE_ENV !== 'production') {
    await upsertUser({
      name: 'Dosen Demo',
      email: 'dosen@lms.test',
      password: 'Dosen12345',
      role: Role.LECTURER,
      identityNumber: '198001012005011001',
    });
    await upsertUser({
      name: 'Mahasiswa Demo',
      email: 'mahasiswa@lms.test',
      password: 'Mahasiswa12345',
      role: Role.STUDENT,
      identityNumber: '1237050001',
    });
    console.log('Akun demo dosen@lms.test & mahasiswa@lms.test dibuat.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
