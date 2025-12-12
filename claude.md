# 🎮 Pong Game Project - Claude Context

## 📌 프로젝트 개요
42 과제용 웹 기반 Pong 게임 (ft_transcendence)

## 🏗️ 현재 기술 스택
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js (Node.js)
- **Database**: Prisma ORM (PostgreSQL)
- **렌더링**: SSR (Server-Side Rendering) 구현됨
- **빌드**: Vite (개발/프로덕션 빌드 모두 작동)

## ✅ 완료된 기능들

### 1. 로컬 게임 모드 ✅
- `src/game/GameEngine.ts`: 게임 엔진 (물리, 충돌 감지, 점수)
- `src/hooks/useGameLoop.ts`: 게임 루프 + 반응형 설정
- `src/components/Game/Game.tsx`: 메인 게임 컴포넌트
- `src/components/Game/LocalGameCanvas.tsx`: 로컬 게임 Canvas 렌더링
- `src/components/Game/GameSettings.tsx`: 게임 설정 UI (커스터마이징 가능)

### 2. 온라인 멀티플레이어 ✅
- **WebSocket 기반 실시간 대전**
- `src/socket/gameHandler.js`: 게임 매니저 + 매치메이킹
- `src/hooks/useSocket.ts`: Socket 통신 훅
- `src/pages/OnlineGame.tsx`: 온라인 게임 페이지
- `src/components/Game/OnlineGameCanvas.tsx`: 온라인 게임 Canvas
- **기능:**
  - 자동 매치메이킹 (1:1)
  - 실시간 게임 상태 동기화 (60 FPS)
  - 부드러운 패들 조작 (키 상태 추적)
  - 연결 해제 처리

### 3. 토너먼트 시스템 ✅ 🆕
- **4인 싱글 엘리미네이션 토너먼트**
- `src/socket/tournamentHandler.js`: 토너먼트 매니저
- `src/pages/Tournament.tsx`: 토너먼트 페이지
- **기능:**
  - 토너먼트 생성 및 참가
  - 자동 대진표 생성
  - 준결승 2경기 **동시 진행** ⚡
  - 결승전 자동 진행
  - 우승자 발표
  - 실시간 토너먼트 상태 업데이트

### 4. 반응형 디자인 ✅
- 세로 모드 (768px 미만): 패들이 위/아래, 가로로 이동
- 가로 모드 (768px 이상): 패들이 좌/우, 세로로 이동
- 터치 컨트롤 지원 (모바일)
- 키보드 컨트롤:
  - Player 1: W/S (가로) or A/D (세로)
  - Player 2: ↑/↓ (가로) or ←/→ (세로)
- 스크롤 방지 (게임 키 입력 시)

### 5. SSR (Server-Side Rendering) ✅
- `server.js`: Express + Vite SSR 미들웨어
- `src/entry-server.tsx`: SSR 엔트리 포인트
- `src/entry-client.tsx`: 클라이언트 하이드레이션
- **최근 수정**: `window` 객체 SSR 안전 처리 완료

### 6. 데이터베이스 설정 ✅
- Prisma 설치 및 설정 완료
- `prisma/schema.prisma`: User, Game, GamePlayer 스키마 정의됨
- Prisma Client 생성 완료
- `src/lib/prisma.ts`: Prisma 클라이언트 인스턴스

## 📁 주요 파일 구조

```
/home/kjung/Desktop/tren/
├── src/
│   ├── game/
│   │   └── GameEngine.ts                # 게임 로직
│   ├── hooks/
│   │   ├── useGameLoop.ts               # 게임 루프 (로컬)
│   │   ├── useKeyboard.ts               # 키보드 입력
│   │   ├── useSocket.ts                 # Socket 통신 (온라인/토너먼트)
│   │   └── useOrientation.ts            # 화면 방향 감지
│   ├── socket/
│   │   ├── gameHandler.js               # 게임 매니저 + 매치메이킹
│   │   └── tournamentHandler.js         # 토너먼트 매니저 🆕
│   ├── components/
│   │   └── Game/
│   │       ├── Game.tsx                 # 로컬 게임 컴포넌트
│   │       ├── LocalGameCanvas.tsx      # 로컬 게임 Canvas
│   │       ├── OnlineGameCanvas.tsx     # 온라인 게임 Canvas
│   │       └── GameSettings.tsx         # 설정 UI
│   ├── pages/
│   │   ├── Home.tsx                     # 홈 화면
│   │   ├── OnlineGame.tsx               # 온라인 매치 🆕
│   │   └── Tournament.tsx               # 토너먼트 🆕
│   ├── api/
│   │   └── routes/                      # API 라우트
│   ├── lib/
│   │   └── prisma.ts                    # Prisma 클라이언트
│   ├── types/
│   │   └── index.ts                     # TypeScript 타입 정의
│   ├── entry-server.tsx                 # SSR 엔트리
│   ├── entry-client.tsx                 # 클라이언트 엔트리
│   └── App.tsx                          # React Router 설정
├── prisma/
│   ├── schema.prisma                    # DB 스키마
│   └── migrations/                      # 마이그레이션
├── server.js                            # Express + Socket.IO 서버
└── package.json

```

## 🐛 최근 수정 사항

### 2024-12-12 대규모 업데이트 🆕
1. **온라인 멀티플레이어 구현** ✅
   - Socket.IO 기반 실시간 대전
   - 매치메이킹 시스템
   - 60 FPS 게임 상태 동기화
   - 부드러운 패들 조작 (keydown/keyup 이벤트)

2. **토너먼트 시스템 구현** ✅
   - 4인 싱글 엘리미네이션
   - 자동 대진표 생성
   - 동시 경기 진행 (준결승 2경기)
   - 실시간 상태 업데이트

3. **로컬/온라인 게임 분리** ✅
   - LocalGameCanvas / OnlineGameCanvas 분리
   - 각 모드별 최적화된 렌더링

4. **버그 수정** ✅
   - 방향키 스크롤 문제 해결
   - 로컬 게임 캔버스 렌더링 이슈 해결
   - 온라인 게임 키보드 입력 개선

### 2024-12-11 수정
1. **SSR 에러 수정** (`src/hooks/useGameLoop.ts`)
   - 문제: `ReferenceError: window is not defined`
   - 해결: `typeof window !== 'undefined'` 체크 추가

2. **빌드 상태**: ✅ 정상 작동

## 🚀 해야 할 작업 (우선순위 순)

### 1. Database API 구현 (30분-1시간) ⭐⭐⭐
**이미 Prisma 설정 완료됨! API만 추가하면 됨**

#### TODO:
```typescript
// server.js 또는 별도 routes/ 폴더에 추가

// 1. 게임 결과 저장
POST /api/games
Body: {
  player1Id: string,
  player2Id: string,
  player1Score: number,
  player2Score: number,
  winnerId: string
}

// 2. 게임 기록 조회
GET /api/games?userId=xxx&limit=10

// 3. 리더보드
GET /api/leaderboard?limit=10
```

#### 파일 생성 필요:
- `src/api/routes/games.ts` (또는 server.js에 직접 추가)
- `src/api/controllers/gameController.ts` (선택사항)

### 2. Browser Compatibility 설정 (10분) ⭐⭐⭐
**매우 빠르게 완료 가능**

#### TODO:
```bash
# .browserslistrc 파일 생성
> 0.5%
last 2 versions
Firefox ESR
not dead
not IE 11

# vite.config.ts에 legacy plugin 추가
npm install -D @vitejs/plugin-legacy
```

### 3. User Management 구현 (1-2시간) ⭐⭐
**Prisma 기반으로 빠르게 구현**

#### TODO:
- 회원가입/로그인 API (`/api/auth/register`, `/api/auth/login`)
- 세션 관리 (express-session)
- 프로필 페이지 (`src/pages/Profile.tsx`)
- 로그인한 유저의 게임 기록 연결

### 4. ~~Remote Players - WebSocket~~ ✅ 완료!
**온라인 멀티플레이어 + 토너먼트 시스템**

#### 구현 완료:
- ✅ Socket.IO 서버 구현
- ✅ 자동 매치메이킹 시스템
- ✅ 실시간 게임 상태 동기화 (60 FPS)
- ✅ 부드러운 입력 처리
- ✅ 4인 토너먼트 시스템
- ✅ 동시 경기 진행

#### 남은 작업:
- ⏳ 토너먼트 중 플레이어 이탈 처리
- ⏳ 대진표 시각화 UI
- ⏳ 관전 모드

## 🎯 모듈 완료 현황

### Major Modules (3/3 필요)
1. ✅ Use a framework to build the backend (Express + Socket.IO)
2. ⏳ Standard User Management (미완성)
3. ✅ Implementing remote players (WebSocket + 토너먼트) 🎉

### Minor Modules (5/5 필요)
1. ✅ Use a framework for frontend (React + Vite)
2. ✅ SSR integration
3. ✅ Support on all devices (반응형 + 터치)
4. ⏳ Use a database for backend (설정 완료, API 미완성)
5. ⏳ Expanding browser compatibility (미완성, 10분이면 완료)

## 💡 중요 참고사항

### 서버 실행
```bash
npm run dev          # 개발 서버 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm run preview      # 프로덕션 미리보기
```

### Prisma 명령어
```bash
npx prisma generate           # Client 생성
npx prisma migrate dev        # 개발 마이그레이션
npx prisma studio             # DB GUI
```

### 타입체크
```bash
npx tsc --noEmit              # TypeScript 에러 체크
```

## 🔧 환경 설정

### 필요한 환경변수 (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pong"
NODE_ENV="development"
PORT=3000
SESSION_SECRET="your-secret-key"
```

## 📝 Prisma Schema 요약

```prisma
model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String
  wins          Int       @default(0)
  losses        Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  gamesAsPlayer1 GamePlayer[] @relation("Player1Games")
  gamesAsPlayer2 GamePlayer[] @relation("Player2Games")
}

model Game {
  id            String    @id @default(cuid())
  player1Score  Int
  player2Score  Int
  winnerId      String?
  createdAt     DateTime  @default(now())
  players       GamePlayer[]
}
```

## 🎨 게임 커스터마이징 가능 항목
- Ball Speed (공 속도)
- Paddle Size (패들 크기)
- Win Score (승리 점수)
- Ball Acceleration (공 가속도)
- Paddle Speed (패들 속도)
- Theme (classic/neon/retro)

## 🚨 알려진 이슈
- ✅ window is not defined (해결됨)
- ✅ Orientation import 미사용 (해결됨)
- ✅ 로컬 게임 캔버스 렌더링 (해결됨)
- ✅ 온라인 게임 키보드 입력 (해결됨)
- ✅ 방향키 스크롤 문제 (해결됨)
- ⚠️ 토너먼트 중 플레이어 이탈 시 게임 멈춤 (수정 예정)
- ⚠️ 프로덕션 환경에서 WebSocket HMR 포트 충돌 가능 (개발시에만 발생, 무시 가능)

## 🎮 게임 모드

### 1. Local Game (로컬 대전)
- 같은 기기에서 2명이 플레이
- 키보드/터치 컨트롤
- 게임 설정 커스터마이징 가능

### 2. Online Match (온라인 대전)
- 자동 매치메이킹
- 실시간 1:1 대전
- 60 FPS 동기화

### 3. Tournament (토너먼트)
- 4인 싱글 엘리미네이션
- 준결승 2경기 동시 진행
- 자동 대진표 생성
- 실시간 토너먼트 진행

## 📚 다음 Claude를 위한 팁
1. "Database API 구현해줘"라고 하면 게임 결과 저장/조회 API 3개 빠르게 추가 가능
2. "Browser compatibility 설정해줘"라고 하면 10분 안에 완료
3. User Management는 express-session + bcrypt 사용 추천
4. WebSocket은 socket.io 사용하면 빠름

## 🎯 Socket.IO 이벤트 구조

### 매치메이킹 이벤트
- `queue:join` - 매치메이킹 큐 참가
- `queue:leave` - 큐 나가기
- `queue:joined` - 큐 참가 확인
- `game:matched` - 매치 성사

### 게임 이벤트
- `game:update` - 게임 상태 업데이트 (60 FPS)
- `game:end` - 게임 종료
- `paddle:keydown` - 패들 키 누름
- `paddle:keyup` - 패들 키 뗌

### 토너먼트 이벤트
- `tournament:create` - 토너먼트 생성
- `tournament:join` - 토너먼트 참가
- `tournament:leave` - 토너먼트 나가기
- `tournament:list` - 사용 가능한 토너먼트 목록
- `tournament:update` - 토너먼트 상태 업데이트
- `tournament:started` - 토너먼트 시작
- `tournament:match-started` - 매치 시작
- `tournament:match-complete` - 매치 완료
- `tournament:round-complete` - 라운드 완료
- `tournament:completed` - 토너먼트 완료

---
**마지막 업데이트**: 2024-12-12 23:45 (KST)
**현재 상태**:
- ✅ 로컬/온라인/토너먼트 모드 모두 작동
- ✅ 실시간 멀티플레이어 구현 완료
- ⏳ 토너먼트 플레이어 이탈 처리 필요
- ⏳ Database/User 기능 추가 대기 중
