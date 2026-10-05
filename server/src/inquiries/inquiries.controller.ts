import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { AdminGuard, CurrentUser, JwtAuthGuard, OptionalAuthGuard } from '../common/guards'
import type { AuthUser } from '../common/token.service'
import {
  CreateInquiryDto,
  ListInquiriesQueryDto,
  MineInquiriesQueryDto,
  UpdateInquiryDto,
} from './dto'
import { InquiriesService } from './inquiries.service'

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  create(@Body() dto: CreateInquiryDto, @CurrentUser() user?: AuthUser) {
    return this.inquiries.create(dto, user?.id ?? null)
  }

  // 정적 경로(counts/mine)를 :id 보다 먼저 선언한다.
  @Get('counts')
  @UseGuards(AdminGuard)
  counts() {
    return this.inquiries.counts()
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Query() query: MineInquiriesQueryDto, @CurrentUser() user: AuthUser) {
    return this.inquiries.findMine(user.id, query)
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll(@Query() query: ListInquiriesQueryDto) {
    return this.inquiries.findAll(query)
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiries.update(id, dto)
  }
}