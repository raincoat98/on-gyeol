import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser, JwtAuthGuard } from '../common/guards'
import type { AuthUser } from '../common/token.service'
import { CreateReviewDto, ListReviewsQueryDto } from './dto'
import { ReviewsService } from './reviews.service'

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  // 정적 경로(mine)를 상세 라우트보다 먼저 선언한다.
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: AuthUser) {
    return this.reviews.findMine(user.id)
  }

  @Get()
  findAll(@Query() query: ListReviewsQueryDto) {
    return this.reviews.findAll(query)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthUser) {
    return this.reviews.create(dto, user.id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.reviews.remove(id, user)
  }
}