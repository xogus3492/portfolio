export const E_COMMERCE_CONTENT = `# E-Commerce Platform

> 대규모 트래픽을 처리하는 풀스택 이커머스 플랫폼

## 개요

MSA(Microservices Architecture) 기반의 이커머스 플랫폼입니다.
상품 관리, 주문 처리, 결제 연동, 사용자 인증 등 핵심 기능을 구현했습니다.

## 주요 기능

- 상품 검색 및 필터링 (Elasticsearch)
- 실시간 재고 관리
- 결제 연동 (포트원 API)
- JWT 기반 인증/인가
- 관리자 대시보드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS, PostgreSQL, Redis |
| Infrastructure | Docker, AWS EC2, S3, CloudFront |
| Monitoring | Prometheus, Grafana |

## 성과

- 동시 접속자 1,000명 처리 성능 달성
- 페이지 로드 시간 40% 단축 (Core Web Vitals 최적화)
- 테스트 커버리지 85% 달성

## 링크

- 🔗 [GitHub Repository](https://github.com)
- 🚀 [Live Demo](https://example.com)

\`\`\`typescript
// 상품 검색 API 예시
async function searchProducts(query: SearchQuery): Promise<Product[]> {
  const result = await elasticsearch.search({
    index: 'products',
    body: {
      query: {
        multi_match: {
          query: query.keyword,
          fields: ['name^3', 'description', 'category'],
        },
      },
    },
  });
  return result.hits.hits.map((hit) => hit._source as Product);
}
\`\`\`
`;

export const CHAT_APP_CONTENT = `# Real-time Chat Application

> WebSocket 기반 실시간 채팅 애플리케이션

## 개요

Socket.io를 활용한 실시간 채팅 서비스입니다.
1:1 채팅, 그룹 채팅, 파일 공유 기능을 지원합니다.

## 주요 기능

- 실시간 메시지 전송/수신
- 읽음 확인 기능
- 파일/이미지 첨부 (AWS S3)
- 온라인 상태 표시
- 메시지 검색

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React, TypeScript, Zustand |
| Backend | Node.js, Socket.io, MongoDB |
| Infrastructure | Docker, AWS ECS |
| CDN | CloudFront |

## 성과

- 실시간 메시지 지연 시간 < 50ms
- 동시 접속 500명 안정적 처리
- 메시지 전달 성공률 99.9%

## 링크

- 🔗 [GitHub Repository](https://github.com)
- 🚀 [Live Demo](https://example.com)
`;

export const TASK_MANAGER_CONTENT = `# Task Manager (칸반 보드)

> 팀 협업을 위한 프로젝트 관리 도구

## 개요

드래그 앤 드롭 기반의 칸반 보드 프로젝트 관리 도구입니다.
팀 단위로 태스크를 관리하고 진행 상황을 추적할 수 있습니다.

## 주요 기능

- 드래그 앤 드롭 태스크 이동 (dnd-kit)
- 실시간 공동 편집 (CRDT)
- 태스크 댓글 및 멘션
- 마감일 알림 (SSE)
- 통계 대시보드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js, TypeScript, Tailwind CSS, dnd-kit |
| Backend | NestJS, PostgreSQL, Redis |
| Auth | NextAuth.js |
| Testing | Jest, Playwright |

## 성과

- E2E 테스트 100% 자동화
- 라이트하우스 점수 95+ 달성
- 모바일 반응형 완벽 지원

## 링크

- 🔗 [GitHub Repository](https://github.com)
- 🚀 [Live Demo](https://example.com)
`;

export const PORTFOLIO_CONTENT = `# Portfolio Website (이 사이트)

> VSCode IDE 테마 기반 개인 포트폴리오 웹사이트

## 개요

VSCode IDE UI를 충실히 재현한 개인 포트폴리오 사이트입니다.
파일 탐색기, 에디터 탭, 마크다운 렌더링 등 VSCode의 핵심 UI를 구현했습니다.

## 주요 기능

- VSCode 파일 탐색기 UI
- 멀티 탭 에디터 (미리보기/고정 탭)
- 마크다운 렌더링 (코드 하이라이팅 포함)
- Breadcrumbs 네비게이션
- 반응형 레이아웃 (모바일 지원)
- 키보드 단축키 (Ctrl+B, Ctrl+W)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand v5 |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| Icons | lucide-react |

## 설계 결정

**왜 Zustand?**
탭 상태는 ActivityBar, Sidebar, TabBar, Editor, StatusBar 등 5개 이상의 컴포넌트가 구독합니다.
Context API 대비 불필요한 리렌더링을 최소화할 수 있어 선택했습니다.

**왜 App Router?**
Server Component로 정적 컨텐츠를 처리하고,
Client Component를 상호작용이 필요한 부분으로 최소화했습니다.

## 링크

- 🔗 [GitHub Repository](https://github.com)
- 🚀 [Live Demo](https://taehyeon-portfolio.com)
`;
