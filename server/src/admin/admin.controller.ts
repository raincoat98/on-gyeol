import { Controller, Get, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../common/guards'
import { AdminService } from './admin.service'

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard()
  }
}