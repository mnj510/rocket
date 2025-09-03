# 🚀 Rocket App

기상 체크 및 MUST 기록을 통한 점수 시스템을 제공하는 Next.js 기반 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🔐 인증 시스템
- **관리자 로그인**: ID: `mnj510`, 비밀번호: `asdf6014!!`
- **멤버 로그인**: 고유 멤버 코드로 로그인

### 📊 기상 체크 시스템
- **기상 완료**: 00:00~04:59 사이에만 가능, 1점 획득
- **개구리 잡기**: 기상 완료 후 가능, 1점 획득
- **실시간 시계**: 현재 시간 표시
- **관리자 수동 체크**: 멤버별 기상 상태 수동 설정

### 📝 MUST 기록 시스템
- **일일 기록**: 매일 해야 할 일 기록
- **어제 기록 비교**: 왼쪽에 어제 기록 표시
- **복사 기능**: 오늘 작성한 내용만 복사 가능
- **점수 획득**: 23:59까지 기록 완료 시 1점

### 📈 대시보드 및 점수 시스템
- **멤버 전용 통계**: 오늘, 기상 성공, 기상률, 총 점수
- **관리자 전체 통계**: 전체 멤버, 전체 기상 성공, 전체 기상률, 전체 점수
- **월별 달력**: 개인 기상 현황 시각화
- **멤버별 순위**: 점수 기반 순위 표시
- **월별 조회**: 드롭다운으로 특정 월 선택

### 👥 멤버 관리 (관리자 전용)
- **멤버 추가**: 새 멤버 등록
- **멤버 삭제**: 기존 멤버 제거
- **멤버 정보 유지**: 삭제 전까지 영구 보존

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 14, TypeScript, Tailwind CSS
- **UI 컴포넌트**: Mantine UI
- **백엔드**: Supabase (데이터베이스, 인증)
- **배포**: GitHub Pages
- **상태 관리**: React Hooks
- **날짜 처리**: Day.js

## 🚀 배포 방법

### 1. GitHub 저장소 설정

1. GitHub에 새 저장소 생성 (이름: `rocket`)
2. 저장소를 로컬에 클론

### 2. 환경 변수 설정

`.env.local` 파일 생성:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. GitHub Pages 설정

1. 저장소 Settings → Pages
2. Source를 "GitHub Actions"로 설정
3. 저장소에 코드 푸시

### 4. 자동 배포

- `main` 브랜치에 푸시하면 자동으로 GitHub Pages에 배포됩니다
- `.github/workflows/deploy.yml` 파일이 자동 배포를 담당합니다

## 🗄️ Supabase 데이터베이스 설정

### 필요한 테이블

#### 1. members
```sql
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  member_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. wakeup_logs
```sql
CREATE TABLE wakeup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  wakeup_status TEXT CHECK (wakeup_status IN ('success', 'failed')),
  frog_status TEXT CHECK (frog_status IN ('success', 'failed')),
  wakeup_time TIMESTAMP WITH TIME ZONE,
  frog_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, date)
);
```

#### 3. must_records
```sql
CREATE TABLE must_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, date)
);
```

#### 4. mobile_login_codes
```sql
CREATE TABLE mobile_login_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_code TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📱 반응형 디자인

- **모바일**: 상단 아이콘과 함께 2열 그리드 메뉴
- **PC**: 왼쪽 사이드바 메뉴
- **대시보드**: 화면 크기에 따라 자동 조정

## 🔧 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 정적 파일 생성 (GitHub Pages용)
npm run export
```

## 🌐 사이트 링크

배포 완료 후: `https://[username].github.io/rocket`

## 📋 점수 시스템

- **기상 완료**: 1점
- **MUST 기록**: 1점  
- **개구리 잡기**: 1점
- **하루 최대**: 3점
- **모든 점수**: 실시간 누적, Supabase 저장

## 🔒 보안 기능

- 관리자 전용 멤버 관리
- 멤버별 데이터 격리
- 로컬 스토리지 기반 세션 관리
- Supabase RLS (Row Level Security) 지원

## 📞 지원

문제가 발생하거나 추가 기능이 필요한 경우 GitHub Issues를 통해 문의해주세요.
