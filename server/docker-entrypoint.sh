#!/bin/sh
set -e

PRISMA=./node_modules/.bin/prisma

# 프로덕션 DB 에 스키마를 적용한다. DB 가 아직 준비되지 않았을 수 있으므로 재시도한다.
n=0
until "$PRISMA" migrate deploy; do
  n=$((n + 1))
  if [ "$n" -ge 10 ]; then
    echo "[entrypoint] prisma migrate deploy ${n}회 실패 — 종료" >&2
    exit 1
  fi
  echo "[entrypoint] migrate 재시도 ${n}/10 (3초 후)" >&2
  sleep 3
done

exec node dist/main