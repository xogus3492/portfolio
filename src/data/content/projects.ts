export const REHAB_CENTER_CONTENT = `# 재활센터 홈페이지

**기간:** 2026.01 ~ 진행중 &nbsp;&nbsp; **유형:** 개인 프로젝트 (외주)

> 홈페이지 제작 외주 개인 프로젝트

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, ESLint |
| 도구 | Cursor, Vercel |

## 주요 기여

- **Notion MCP Server 활용 자동화 프로세스 구축**
  - 고객이 RFP 작성 → Agent가 추가된 요구사항 감지 → 검증 및 소스코드 반영
  - 요구사항 변경 대응 프로세스를 자동화하여 개발 생산성 향상

## 링크

- [![](/icons/github.png) GitHub](https://github.com/xogus3492/sm-rehabilitation-center-website)
- 🚀 [Live Site](https://sm-rehabilitation-center.vercel.app/)
`;

export const LITTLE_BANK_CONTENT = `# 🏦 리틀뱅크 (LittleBank)

**기간:** 2025.03 ~ 2025.07 &nbsp;&nbsp; **유형:** 팀 프로젝트

## 팀 구성 & 역할

| 구성 | 역할 |
|------|------|
| App(PM) 1명, Back-end 2명, Design 1명 | **Back-end, PL** |

## 서비스 소개

> **리틀뱅크**는 학습 미션 시스템을 통해 아이가 미션을 수행하면 부모가 약속한 보상을 주어, 아이에게 학습 동기를 주는 어플입니다.
>
> 부모 유저가 자녀 계정과 연동하여 목표 관리, 미션 설정, 목표 달성 등 모니터링할 수 있는 서비스를 제공합니다.

## 시스템 아키텍처

![CI/CD Architecture](https://github.com/user-attachments/assets/37f4dbdb-5424-49b0-84a6-c40dbfecb4ab)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Java 17, Spring Boot 3.x, Spring Security, JPA, QueryDSL |
| Database | MySQL 8.0, Redis |
| Infra | AWS, Docker, Nginx |
| CI/CD | GitHub Actions, CodeDeploy |
| External | Firebase, Amazon S3 |
| Real-time | WebSocket (STOMP) |
| 문서화 | Swagger |

## 주요 성과

### 1. CI/CD 파이프라인 구축

GitHub Actions + CodeDeploy를 활용한 자동 배포 환경 구성으로
배포 과정 자동화 및 운영 편의성 개선

### 2. 채팅방 API 구조 개선

클라이언트에서 처리하던 채팅방 정렬·읽음 상태를
BFF(Backend For Frontend) 관점의 API로 분리하여 클라이언트 부하 감소

### 3. 결제 위변조 방지 플로우 구현

Toss Payments API 기반으로
결제 전 정보를 서버에 저장 → 승인 후 비교 검증하는 플로우를 설계하여 위변조 방지

## 서비스 화면

<div class="img-grid">
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/4c36e5c1-6fe9-449c-a730-f97c7b3e640f" alt="홈" />
    <span>홈</span>
  </div>
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/f4cd2966-7c56-4c27-8478-d3f5fa43d4aa" alt="채팅" />
    <span>채팅</span>
  </div>
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/065b0414-c592-4f3e-a466-6d4a21f80699" alt="챌린지" />
    <span>챌린지</span>
  </div>
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/7f353d6b-2857-4e95-a8a9-7baf6f8cf909" alt="1:1 경쟁" />
    <span>1:1 경쟁</span>
  </div>
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/6270a9db-11fd-429b-8c64-87c745dc8e16" alt="랭킹" />
    <span>랭킹</span>
  </div>
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/08206b84-d264-4bab-a9c9-e91947a33adc" alt="피드" />
    <span>피드</span>
  </div>
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/efe79236-aad1-4153-b3b7-f11fea22d898" alt="결제" />
    <span>결제</span>
  </div>
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/9e8c2673-f6c4-40d1-845f-982549f4831f" alt="구독" />
    <span>구독</span>
  </div>
  <div class="img-grid-item">
    <img src="https://github.com/user-attachments/assets/36849642-2b5d-41ac-b7d4-fde69f7161ad" alt="혜택" />
    <span>혜택</span>
  </div>
</div>

## 링크

[![](/icons/github.png) GitHub](https://github.com/little-bank/littlebank-server)
`;

export const DEVHUB_CONTENT = `# DEVHUB

**기간:** 2024.07 ~ 2024.10 &nbsp;&nbsp; **유형:** 팀 프로젝트

> 초보 개발자를 위한 프로젝트 형상관리 서비스

## 팀 구성 & 역할

| 구성 | 역할 |
|------|------|
| Front-end 2명, Back-end 3명 | **Back-end, PL** |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Spring Boot, JPA, Spring Security, JWT |
| Database | MySQL, Redis |
| Infra | Nginx, Docker, AWS |

## 주요 기여

### 1. 이메일 발신 기능 성능 개선

\`\`\`
개선 전: 4,159ms
개선 후:    17ms
\`\`\`

동기 처리 → 비동기 처리로 전환하여 응답 시간 **99% 단축**

### 2. 형상관리 전략 설계

Snapshot 방식 vs Git 방식의 트레이드오프를 분석하여 최적 전략 채택

### 3. 동시 저장 방지

DB 락(Lock)을 활용하여 동시 요청에 의한 데이터 정합성 문제 해결

## 링크

- [![](/icons/github.png) GitHub](https://github.com/Devs-Of-Kosmo/devhub-server)
- 📄 [Notion 문서](https://wheat-eustoma-8a4.notion.site/DEVHUB-40f17eb25bf84bd8ba87caa17c444d2b)
`;

export const BOARD_CONTENT = `# 게시판 프로젝트

**기간:** 2023.03 ~ 2023.05 &nbsp;&nbsp; **유형:** 팀 프로젝트

> 서비스 최적화를 통한 실무 수준 개발 프로젝트

## 팀 구성 & 역할

| 구성 | 역할 |
|------|------|
| Leader 1명, Back-end 2명 | **Back-end** |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Spring Boot, JPA, Querydsl |
| Database | H2, Redis |

## 트러블 슈팅

### 1. JPA N+1 문제 해결

연관 엔티티 조회 시 발생하는 N+1 문제를 **Fetch Join**으로 해결하여
쿼리 수를 N+1개 → 1개로 최적화

### 2. 좋아요 기능 동시성 문제 해결

다수의 사용자가 동시에 좋아요를 누르는 상황에서
**비관적 락(Pessimistic Lock)** 을 적용하여 데이터 정합성 보장

## 링크

- [![](/icons/github.png) GitHub](https://github.com/Cupid-Arrow-team/Board/tree/develop)
`;

export const FYB_CONTENT = `# FYB (Fit Your Balance)

**기간:** 2022.03 ~ 2022.11 &nbsp;&nbsp; **유형:** 팀 프로젝트

> 빅데이터 기반 개인 맞춤형 쇼핑몰 추천 서비스

## 팀 구성 & 역할

| 구성 | 역할 |
|------|------|
| Back-end 1명, Android 1명, Design 2명 | **Android** |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Mobile | Android, Java |
| 네트워크 | Retrofit2, OkHttp3, Gson |

## 주요 기여

- Retrofit2 기반 REST API 클라이언트 구현
- OkHttp3 인터셉터를 활용한 공통 헤더 처리
- Gson을 사용한 JSON 직렬화/역직렬화 처리
- 빅데이터 추천 결과를 Android UI에 연동

## 링크

- [![](/icons/github.png) GitHub](https://github.com/xogus3492/Front_Android)
- 📄 [Notion 문서](https://wheat-eustoma-8a4.notion.site/FYB-1402cd91589f4e5fb177c0e85b31d4c1)
`;
