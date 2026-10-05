import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { Response } from 'express'

/**
 * Prisma 예외를 HTTP 상태로 매핑한다.
 * - 잘못된 UUID 등 잘못된 입력(P2023) → 400
 * - 유니크 제약 위반(P2002) → 409
 * - 대상 없음(P2025) → 404
 * 매핑되지 않은 코드는 500 으로 남긴다.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name)

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    const status =
      exception.code === 'P2023' || exception.code === 'P2000' || exception.code === 'P2005' || exception.code === 'P2006'
        ? HttpStatus.BAD_REQUEST
        : exception.code === 'P2002'
          ? HttpStatus.CONFLICT
          : exception.code === 'P2025'
            ? HttpStatus.NOT_FOUND
            : HttpStatus.INTERNAL_SERVER_ERROR

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception.message)
    }

    response.status(status).json({
      statusCode: status,
      message: status === HttpStatus.BAD_REQUEST ? '요청 값이 올바르지 않습니다.' : '요청을 처리할 수 없습니다.',
      code: exception.code,
    })
  }
}