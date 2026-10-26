# BuildLog 실행 준비와 Phase 0 점검 결과

## 1. 현재 상태

2026-10-26(한국 시간)에 Phase 0의 문서·환경 점검을 수행했습니다. 확인 가능한 점검은 마쳤으나, 미정 규칙과 인증서 문제가 있어 **Phase 0 전체 완료 조건은 아직 충족하지 못했습니다.** Phase 1은 시작하지 않았습니다.

패키지 설치, 가상환경 생성, 코드 작성, 데이터베이스 생성, Git 초기화·커밋은 하지 않았습니다. 이 문서와 계획의 점검 기록만 작성했습니다. 기존 README는 변경하지 않았습니다.

## 2. 실제 환경 확인 결과

| 항목 | 결과 | 판단 |
| --- | --- | --- |
| Python | 3.13.17 | 실행 가능 |
| Python 실행 경로 | `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3` | 이후 가상환경 생성 기준 |
| Node.js | 26.10.0 | 실행 가능 |
| npm | 11.19.1 | 실행 가능 |
| SQLite | 3.50.4 | Python의 sqlite3 모듈 사용 가능 |
| venv·ensurepip | 모듈 존재 | 가상환경 생성은 아직 미실행 |
| FastAPI | 현재 Python 환경에 없음 | Phase 1에서 설치할 대상 |
| 포트 5173·8000 | 127.0.0.1에 실행 중인 리스너 없음 | 점검 시점 결과이며 실행 직전 재확인 |
| Python HTTPS | PyPI·npm 메타데이터 조회 시 인증서 검증 실패 | 설치 전 원인 확인 필요 |
| curl HTTPS | 인증서 검증을 유지한 조회 성공 | Python HTTPS와 결과가 다름 |

Python HTTPS 오류는 `CERTIFICATE_VERIFY_FAILED: unable to get local issuer certificate`입니다. 인증서 검증을 끄지 않았고 시스템 인증서 설정도 변경하지 않았습니다. pip 설치 가능 여부까지 확인한 것은 아닙니다. Phase 1 설치 전 Python 인증서 경로·설치 환경을 확인하고 안전한 해결 방법을 적용해야 합니다.

## 3. 개발 도구 선정과 버전 확인

다음은 프로젝트 내부 구현 도구로 선정한 구성입니다. 실제 패키지 설치와 전체 의존성 호환 검증은 Phase 1에서 수행합니다.

| 용도 | 구성 | 확인한 배포 버전 | 공개된 실행 조건 |
| --- | --- | --- | --- |
| API | FastAPI | 0.162.0 | Python >=3.10 |
| 화면 | React | 19.3.1 | 브라우저 화면 라이브러리 |
| React 개발·빌드 | Vite | 8.3.5 | Node ^20.19.0 또는 >=22.12.0 |
| 데이터 접근 | SQLAlchemy | 2.1.6 | Python >=3.11 |
| DB 구조 변경 이력 | Alembic | 1.20.1 | Python >=3.10 |

버전은 점검 시 PyPI·npm의 공개 배포 메타데이터를 HTTPS로 읽은 값입니다. 설치 완료 또는 전 조합 테스트 완료를 의미하지 않습니다. Python 3.13.17과 Node 26.10.0은 위 실행 버전 조건을 충족합니다. Python·Node는 현재 설치 버전을 우선 사용하고 실제 설치·테스트 결과에 따라 호환 문제를 확인합니다.

React는 JavaScript와 Vite, 패키지 관리자는 npm을 사용합니다. 서버 데이터 처리는 SQLAlchemy, 구조 변경 이력은 Alembic으로 관리합니다. SQLite3에서 먼저 검증하고 Supabase PostgreSQL에서 다시 확인합니다. PostgreSQL 드라이버와 인증 패키지는 해당 단계에서 필요한 것만 정합니다.

확인 출처:

- [FastAPI 배포 정보](https://pypi.org/pypi/fastapi/json)
- [React 배포 정보](https://registry.npmjs.org/react/latest)
- [Vite 배포 정보](https://registry.npmjs.org/vite/latest), [공식 시작 안내](https://vite.dev/guide/)
- [SQLAlchemy 배포 정보](https://pypi.org/pypi/sqlalchemy/json), [SQLite·PostgreSQL 지원 문서](https://docs.sqlalchemy.org/en/20/dialects/)
- [Alembic 배포 정보](https://pypi.org/pypi/alembic/json), [공식 문서](https://alembic.sqlalchemy.org/en/latest/)

## 4. 주소·경로·환경 변수 기준

| 항목 | 사용할 기준 |
| --- | --- |
| React 주소 | `http://localhost:5173` |
| FastAPI 주소 | `http://localhost:8000` |
| 브라우저 통신 허용 주소 | `http://localhost:5173` |
| 서버 가상환경 | `backend/.venv` |
| 개발 DB | `database/buildlog.sqlite3` |
| 자동 테스트 DB | 테스트마다 별도 임시 SQLite3 DB 사용 |
| 실제 서비스 DB | Supabase PostgreSQL, Phase 13에서 별도 개발 프로젝트 연동 검증 |
| 서버 환경 파일 | `backend/.env`, 예시는 `backend/.env.example` |
| 화면 환경 파일 | `frontend/.env`, 예시는 `frontend/.env.example` |

서버 변수는 `DATABASE_URL`, `TEST_DATABASE_URL`, `CORS_ORIGINS`를 사용합니다. React에는 공개 가능한 `VITE_API_BASE_URL`만 둡니다. 인증용 비밀값과 변수는 인증 방식 결정 후 정합니다. Supabase DB 연결 문자열은 서버의 `DATABASE_URL`로 설정하고 브라우저에는 전달하지 않습니다.

현재 .gitignore는 환경 파일·설치 폴더·생성 결과·로그를 제외하고 `.env.example`을 허용합니다. SQLite3 파일 제외는 아직 없어 Phase 1에서 DB 생성 전에 보완해야 합니다. Phase 0에서는 .gitignore를 바꾸지 않았습니다.

## 5. 실행·테스트 명령 준비안

아래 명령은 **향후 만들 파일과 스크립트를 기준으로 한 예정 명령**입니다. 현재는 프로젝트 코드가 없어 실행할 수 없고, 실행 검증도 하지 않았습니다.

| 작업 | 실행 위치 | 예정 명령 |
| --- | --- | --- |
| API 개발 서버 | backend | `.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` |
| React 개발 서버 | frontend | `npm run dev -- --host localhost --port 5173` |
| 서버 테스트 | backend | `.venv/bin/python -m pytest` |
| 화면 테스트 | frontend | `npm run test -- --run` |
| 화면 빌드 | frontend | `npm run build` |
| DB 구조 적용 | backend | `.venv/bin/python -m alembic upgrade head` |

서버 테스트는 pytest, 화면 테스트는 Vitest와 React Testing Library를 도구 기준으로 사용합니다. 필요한 단계에서 설치·스크립트를 구성하고 정확한 버전과 실제 통과한 명령을 기록합니다. DB 구조 적용은 Phase 2부터 진행하며, Supabase 대상 실행은 환경을 구분합니다.

## 6. 문서 일치 여부 점검

기준 문서는 `frontend/PRD.md`, `docs/spec.md`, `docs/plan.md`입니다. 현재 `docs/mvp.md`와 `docs/PRD.md`는 실제 파일 목록에 없고 MVP·PRD는 frontend에 있습니다. IDE 탭 표시와 실제 파일 위치를 구분합니다.

### 일치한 내용

- FastAPI·React, 실제 DB Supabase, 초기 개발·테스트 SQLite3 구성
- 회원가입·로그인·닉네임 변경과 사용자별 비공개 기록 분리
- 공부 기록·할 일·오류 기록과 각 입력 길이·상태·검색 범위
- 로그인 사용자만 공개 기록 조회
- 공부·오류 기록의 댓글·좋아요와 공개 할 일의 댓글·좋아요 제외
- 신고, 운영자 전용 확인, 자동 삭제와 신고 처리 상태 제외
- 360px 이상 화면 및 Chrome·Edge·Safari 최신 두 버전 지원
- 이메일 확인·비밀번호 찾기·할 일 마감일·중요도·내 할 일 검색·답글 제외

MVP에는 후속 문서에서 이미 결정된 항목이 과거 미정 상태로 남아 있습니다. 기능 구현에는 더 구체적인 PRD·spec을 따릅니다. 이번 점검에서는 기존 요구사항을 임의로 재작성하지 않았습니다.

### 미정·충돌 목록

| 항목 | 확인한 문제 | 결정이 필요한 시점 |
| --- | --- | --- |
| 인증 방식 | FastAPI 자체 인증 또는 Supabase Auth 중 미선택 | Phase 0 종료 전 |
| 로그인 유지·종료 | 유지 기간과 로그아웃 방식 미정 | 회원 기능 설계 전 |
| 새 오류 상태 | spec 6.1은 처음부터 해결 저장 허용과 새 오류 미해결 저장을 함께 명시. plan Phase 7은 새 오류 미해결 명시 | Phase 0의 명세 정합성 확인 완료 전 |
| 연결 데이터 삭제 | 기록·댓글 삭제 시 댓글·좋아요·신고 보존·삭제 방식 미정. 비공개 전환 시 보존은 확정 | 데이터 관계 설계 전 |
| 대소문자 | 이메일·닉네임 중복 검사 및 검색의 영문 대소문자 구분 미정 | 회원·검색 구현 전 |
| 검색·필터 조합 | 빈 검색어가 전체 목록을 뜻할 때 기존 상태·종류 필터를 유지할지 미정 | 목록 구현 전 |
| 홈 카드 | 표시할 기록의 종류별 개수·순서 등 세부 기준 미정 | 홈 내용 구현 전 |

미정 항목은 하나씩 사용자에게 확인합니다. 답변 없이 구현값으로 확정하지 않습니다.

## 7. Phase 0 결과와 다음 행동

- [x] 문서·제외 기능·현재 파일 위치 확인
- [x] Python·Node.js·npm·SQLite3 읽기 전용 확인
- [x] 공식 배포 정보와 실행 조건 확인, 개발 도구 선정
- [x] 주소·경로·환경 변수·실행 및 테스트 명령 준비안 정리
- [x] 설치·코드·DB·Git 작업을 진행하지 않음
- [ ] 인증 방식과 Phase 0 종료 전 필수 명세 충돌 해소
- [ ] Python HTTPS 인증서 문제 해결 및 패키지 설치 전 통신 확인
- [ ] 남은 결정 사항 반영 후 Phase 0 완료 판정

지금 사용자에게 필요한 첫 결정은 회원 인증 방식입니다. Supabase 프로젝트·비밀번호·운영자 계정을 지금 전달할 필요는 없습니다. Phase 1 진행은 남은 항목을 해결하고 결과를 공유한 뒤 확인받습니다.
