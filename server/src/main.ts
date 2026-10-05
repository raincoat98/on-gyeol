import './common/load-env'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import type { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { AppModule } from './app.module'
import { PrismaExceptionFilter } from './common/prisma-exception.filter'
import { UPLOAD_DIR } from './common/uploads'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.use(cookieParser())

  const uploadDir = join(process.cwd(), UPLOAD_DIR)
  mkdirSync(uploadDir, { recursive: true })
  app.useStaticAssets(uploadDir, { prefix: `/${UPLOAD_DIR}/` })

  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  app.enableCors({ origin: origins, credentials: true })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new PrismaExceptionFilter())

  await app.listen(Number(process.env.PORT ?? 4000))
}

void bootstrap()