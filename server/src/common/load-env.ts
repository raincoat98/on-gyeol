import { existsSync } from 'fs'

// 다른 모듈이 process.env 를 읽기 전에 .env 를 로드한다. (이 파일을 가장 먼저 import)
if (existsSync('.env')) {
  process.loadEnvFile('.env')
}