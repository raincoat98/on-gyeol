import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { TokenService } from './token.service'

@Global()
@Module({
  providers: [PrismaService, TokenService],
  exports: [PrismaService, TokenService],
})
export class CommonModule {}