import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ACCESS_COOKIE } from '../common/constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { SafeUser } from '../common/user';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { LookupUsersDto } from './dto/lookup-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@ApiCookieAuth(ACCESS_COOKIE)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // ---- Profil sendiri (semua role). Harus di atas ':id' agar 'me' tidak dianggap id. ----
  @Patch('me/profile')
  @ApiOperation({ summary: 'Ubah nama profil sendiri' })
  async updateProfile(@CurrentUser() user: SafeUser, @Body() dto: UpdateProfileDto) {
    return { user: await this.users.updateProfile(user.id, dto) };
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Ubah kata sandi sendiri' })
  changePassword(@CurrentUser() user: SafeUser, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(user.id, dto);
  }

  // ---- Untuk modul lain (dropdown dosen / mahasiswa) ----
  @Get('lookup')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Daftar ringkas dosen/mahasiswa aktif untuk dropdown' })
  lookup(@Query() query: LookupUsersDto) {
    return this.users.lookup(query);
  }

  // ---- CRUD pengguna (khusus ADMIN) ----
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Daftar pengguna (pagination, pencarian, filter)' })
  findAll(@Query() query: ListUsersDto) {
    return this.users.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { user: await this.users.findOne(id) };
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Buat pengguna (admin dapat membuat dosen/admin)' })
  async create(@Body() dto: CreateUserDto) {
    return { user: await this.users.create(dto) };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @CurrentUser() actor: SafeUser) {
    return { user: await this.users.update(id, dto, actor) };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: SafeUser) {
    return this.users.remove(id, actor);
  }
}
