import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { CreateAddressDto, UpdateAddressDto } from './dto'

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  }

  create(userId: string, dto: CreateAddressDto) {
    const isDefault = dto.isDefault ?? false
    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        })
      }
      return tx.address.create({
        data: {
          userId,
          label: dto.label ?? '집',
          recipientName: dto.recipientName,
          phone: dto.phone,
          address: dto.address,
          isDefault,
        },
      })
    })
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    await this.assertOwned(userId, id)
    return this.prisma.$transaction(async (tx) => {
      // 기본 배송지로 지정하면 같은 사용자의 나머지 배송지를 해제한다.
      if (dto.isDefault === true) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        })
      }
      return tx.address.update({
        where: { id },
        data: {
          label: dto.label ?? undefined,
          recipientName: dto.recipientName ?? undefined,
          phone: dto.phone ?? undefined,
          address: dto.address ?? undefined,
          isDefault: dto.isDefault,
        },
      })
    })
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id)
    await this.prisma.address.delete({ where: { id } })
  }

  /** 본인 소유가 아니면 404 — 다른 사용자의 배송지 존재 여부를 노출하지 않는다. */
  private async assertOwned(userId: string, id: string): Promise<void> {
    const address = await this.prisma.address.findFirst({ where: { id, userId } })
    if (!address) throw new NotFoundException('배송지를 찾을 수 없습니다.')
  }
}