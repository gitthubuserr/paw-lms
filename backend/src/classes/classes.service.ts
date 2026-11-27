import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateLecturer(lecturerId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: lecturerId },
    });

    if (!user) {
      throw new NotFoundException(
        `User dengan ID ${lecturerId} tidak ditemukan`,
      );
    }

    if (user.role !== 'LECTURER' && user.role !== 'ADMIN') {
      throw new BadRequestException(
        'Pengajar kelas harus memiliki role LECTURER atau ADMIN',
      );
    }
  }

  async create(createClassDto: CreateClassDto) {
    await this.validateLecturer(createClassDto.lecturerId);

    return this.prisma.class.create({
      data: createClassDto,
      include: {
        lecturer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.class.findMany({
      include: {
        lecturer: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            materials: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLecturers() {
    return this.prisma.user.findMany({
      where: { role: { in: ['LECTURER', 'ADMIN'] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const kelas = await this.prisma.class.findUnique({
      where: { id },
      include: {
        lecturer: { select: { id: true, name: true, email: true } },
        enrollments: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
        materials: true,
        assignments: true,
      },
    });

    if (!kelas) {
      throw new NotFoundException(`Kelas dengan ID ${id} tidak ditemukan`);
    }

    return kelas;
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    await this.findOne(id);

    if (updateClassDto.lecturerId !== undefined) {
      await this.validateLecturer(updateClassDto.lecturerId);
    }

    return this.prisma.class.update({
      where: { id },
      data: updateClassDto,
      include: {
        lecturer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.class.delete({
      where: { id },
    });
  }
}