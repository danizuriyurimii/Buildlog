# BuildLog 실행 준비와 Phase 0 점검 결과

## 1. Phase 0 당시 상태

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

## 8. Phase 1 구현 결과 (2026-10-26)

사용자의 Phase 1 진행 요청에 따라 미정 인증·기록 규칙과 무관한 실행 뼈대만 구현했습니다. Phase 0의 미정 항목을 임의로 확정하거나 완료 처리하지 않았습니다.

### 구현한 내용

- FastAPI 시작점과 `GET /api/health` 상태 확인 API
- 서버 `.env` 읽기, 프로젝트 위치 기준 SQLite3 URL 준비, 허용 프론트 주소 설정
- React·Vite 기본 화면, API 연결 확인·실패 안내·재시도·8초 시간 제한
- 모바일 기본 배치, 서버·프론트 환경 변수 예시, 설치 버전 기록과 프론트 잠금 파일
- 자동 테스트와 생성 파일 제외 규칙

회원·인증·DB 연결·DB 파일 생성·마이그레이션은 구현하거나 실행하지 않았습니다. 공개 상태 확인 API는 비밀값이나 설정을 반환하지 않습니다. 현재 CORS는 개발 프론트 `http://localhost:5173`만 허용합니다. CORS는 브라우저 통신 정책이며 회원 권한 검사를 대신하지 않습니다.

### 설치와 실행

프로젝트 최상위에서 서버 설치:

```sh
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
```

첫 번째 터미널에서 서버 실행:

```sh
cd backend
.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

두 번째 터미널에서 화면 설치·실행:

```sh
cd frontend
npm ci
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다. ‘FastAPI 서버 연결 완료’가 보이는지 확인합니다. 서버가 꺼져 있으면 실패 안내와 ‘다시 확인’ 버튼이 나타나야 합니다. 기본값으로 실행할 수 있으므로 지금 `.env`나 비밀키를 직접 만들 필요는 없습니다. 설정을 바꾸려면 각 폴더의 `.env.example`을 같은 폴더의 `.env`로 복사해 수정합니다.

서버 설정은 `backend/.env`에서, 프론트 설정은 `frontend/.env`에서 읽습니다. 개발 SQLite3 경로는 서버 코드에서 프로젝트 절대 경로로 계산하며 아직 DB를 열지 않습니다. 프론트 환경 변수를 변경하면 개발 서버를 재시작합니다.

### 검증 명령과 결과

프로젝트 최상위에서:

```sh
backend/.venv/bin/python -m pytest backend/tests -c backend/pytest.ini
npm --prefix frontend run test -- --run
npm --prefix frontend run build
```

- 서버 3개 통과: 응답 내용, 허용 출처, 미허용 출처 CORS 검사
- 화면 3개 통과: 연결 성공, 네트워크 실패 후 재시도, 예상 밖 API 응답 거절
- 프론트 배포용 빌드 성공
- 실제 실행한 서버의 상태 API와 Vite HTML 응답 확인
- 설치 폴더·빌드·SQLite3 제외 확인, 데이터베이스 파일 미생성 확인
- 실제 브라우저 조작 도구가 없어 화면 육안 확인과 브라우저에서의 실제 API 통신은 미검증. 따라서 Phase 1의 직접 화면 확인 완료 조건은 남아 있습니다.

서버 테스트에서 Starlette가 httpx TestClient의 향후 지원 변경에 관한 경고를 한 건 출력했으나 3개 테스트는 통과했습니다. 이후 의존성 갱신 시 점검합니다.

Phase 0에서 Python 표준 HTTPS 조회 오류가 있었지만 이번 가상환경의 pip는 인증서 검증을 끄지 않고 설치에 성공했습니다. 시스템 인증서 설정은 바꾸지 않았으며 표준 urllib의 인증서 문제가 해결되었다고 판단하지 않습니다.

### 다음 단계

현재 Phase 1은 구현·자동 검증 완료, 직접 브라우저 화면 확인 대기 상태입니다. 개발 서버는 검증 후 종료했습니다. 위 명령으로 실행할 수 있습니다. Phase 2는 시작하지 않았습니다. Phase 2 전에 회원 인증 방식과 사용자 데이터 관련 미정 규칙을 확정해야 합니다.

## 9. Phase 2·3 구현 결과 (2026-10-26)

사용자 요청에 따라 Phase 2의 저장소는 내부 SQLite3로 확정하고, Supabase 연동은 진행하지 않았습니다. 회원 인증도 FastAPI가 직접 처리합니다. Supabase는 관련 수업 후 별도 Phase에서 검토합니다.

### 구현한 내용

- SQLite3의 `users`, `login_sessions` 테이블과 첫 Alembic 마이그레이션
- 이메일·닉네임 중복 방지와 닉네임 형식 검사
- Argon2 방식의 비밀번호 해시 저장
- 회원가입, 로그인, 현재 사용자 확인, 닉네임 변경 FastAPI API
- 원문 대신 SHA-256 해시로 저장하는 무작위 로그인 세션 토큰
- 브라우저가 닫힐 때 사라지는 HttpOnly 세션 쿠키와 서버의 7일 유효기간
- React 회원가입·로그인·내 기록 홈·닉네임 변경 화면
- 로그인하지 않은 사용자의 홈·계정 설정 접근 차단

이메일과 영문 닉네임은 대소문자를 구분하지 않고 중복을 검사합니다. 닉네임 화면 표시는 사용자가 입력한 표기를 유지합니다. 로그아웃, 이메일 확인, 비밀번호 찾기는 현재 PRD 범위가 아니므로 추가하지 않았습니다.

### 데이터베이스 준비

프로젝트 DB는 다음 명령으로 준비하거나 최신 상태로 맞춥니다.

```sh
cd backend
.venv/bin/python -m alembic upgrade head
```

현재 `database/buildlog.sqlite3`에 `users`, `login_sessions`, `alembic_version` 테이블을 생성했습니다. 실제 사용자 데이터는 넣지 않았으며 DB 파일은 Git 제외 대상입니다. SQLite3를 계속 사용하므로 Supabase 주소나 API 키를 준비할 필요가 없습니다.

### 확인한 결과

- 백엔드 자동 테스트 18개 통과
- 프론트 자동 테스트 4개 통과
- React 배포용 빌드 통과
- 첫 마이그레이션 적용과 현재 구조 차이 검사 통과
- 별도 임시 SQLite3에서 실제 HTTP 회원가입(201), 로그인(200), 현재 사용자 조회(200), 닉네임 변경(200) 확인
- 비로그인 사용자 조회(401), 대소문자만 다른 이메일 중복(409), HttpOnly 쿠키 확인
- 프로세스를 다시 만든 뒤에도 같은 SQLite3 사용자로 로그인 가능함을 자동 테스트로 확인

실제 브라우저를 조작하는 도구가 없어 화면의 육안 확인과 브라우저 쿠키 동작은 확인하지 못했습니다. Vite의 `/`와 `/signup` 응답, React 화면 테스트, FastAPI 실제 HTTP 흐름으로 대체 확인했습니다.

### 다음 할 일

1. 브라우저에서 회원가입 → 로그인 → 닉네임 변경 흐름을 직접 확인합니다.
2. 다음 개발 작업은 Phase 4의 공부 기록·할 일·오류 기록 데이터 구조입니다.
