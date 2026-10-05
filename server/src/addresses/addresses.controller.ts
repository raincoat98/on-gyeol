import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CurrentUser, JwtAuthGuard } from '../common/guards'
import { serialize } from '../common/serialize'
import type { AuthUser } from '../common/token.service'
import { AddressesService } from './addresses.service'
import { CreateAddressDto, UpdateAddressDto } from './dto'

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return serialize(await this.addresses.findAll(user.id))
  }

  @Post()
  async create(@Body() dto: CreateAddressDto, @CurrentUser() user: AuthUser) {
    return serialize(await this.addresses.create(user.id, dto))
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: AuthUser,
  ) {
    return serialize(await this.addresses.update(user.id, id, dto))
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.addresses.remove(user.id, id)
  }
}