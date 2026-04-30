export const REHAB_CENTER_CONTENT = `# <img src="/icons/house-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> 재활센터 홈페이지

**기간:** 2026.01 ~ 진행중 &nbsp;&nbsp; **유형:** 개인 프로젝트 (외주)

> 홈페이지 제작 외주 개인 프로젝트

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, ESLint |
| 도구 | Cursor, Vercel |

## 성과

- **Notion MCP Server 활용 자동화 프로세스 구축**
  - 고객이 RFP 작성 → Agent가 추가된 요구사항 감지 → 검증 및 소스코드 반영
  - 요구사항 변경 대응 프로세스를 자동화하여 개발 생산성 향상

## 링크

- [![](/icons/github.svg) sm-rehabilitation-center-website](https://github.com/xogus3492/sm-rehabilitation-center-website)
- 🌐 [Live Site](https://sm-rehabilitation-center.vercel.app/)
`;

export const LITTLE_BANK_CONTENT = `# <img src="/icons/littlebank-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> 리틀뱅크 (LittleBank)

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

PR이 \`develop\` / \`main\` 브랜치에 **머지될 때만** 자동 배포되도록 트리거 조건을 설정하고,
GitHub Actions → S3 업로드 → AWS CodeDeploy 순서로 파이프라인을 구성했습니다.
환경 설정 파일은 Base64 인코딩된 GitHub Secrets에서 런타임에 복원하여 레포에 노출되지 않게 관리했습니다.

\`\`\`yaml
# .github/workflows/trigger-dev.yml
on:
  pull_request:
    branches: [ develop ]
    types: [ closed ]

jobs:
  build-and-deploy:
    if: github.event.pull_request.merged == true
    steps:
      - name: Generate application.yml
        run: echo "\${{ secrets.APPLICATION_YML }}" | base64 --decode > ./src/main/resources/application.yml
      - name: Zip & Upload to S3
        run: |
          zip -r ./\${{ github.sha }}.zip .
          aws s3 cp ./\${{ github.sha }}.zip s3://\${{ secrets.S3_BUCKET_NAME_DEV }}/deploy/\${{ github.sha }}.zip
      - name: Trigger CodeDeploy
        run: |
          aws deploy create-deployment \
            --application-name littlebank-deploy \
            --deployment-group-name env-dev
\`\`\`

Docker 멀티스테이지 빌드로 빌드 환경과 실행 환경을 분리해 최종 이미지 크기를 최소화했습니다.

\`\`\`dockerfile
FROM amazoncorretto:17 AS builder
WORKDIR /app
COPY . .
RUN ./gradlew clean build -x test

FROM amazoncorretto:17
COPY --from=builder /app/build/libs/app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

---

### 2. WebSocket 기반 실시간 채팅 구현

**STOMP 연결 단계 JWT 인증**

HTTP 필터 체인이 아닌 STOMP \`CONNECT\` 커맨드 단계에서 JWT를 검증합니다.
WebSocket은 최초 HTTP Upgrade 요청 이후 HTTP 필터가 동작하지 않으므로, 채널 인터셉터로 연결 자체를 보호했습니다.

\`\`\`java
@Component
public class StompChannelInterceptor implements ChannelInterceptor {
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractBearerToken(accessor.getFirstNativeHeader("Authorization"));
            if (tokenProvider.validateToken(token)) {
                accessor.setUser(tokenProvider.getAuthentication(token));
            }
        }
        return message;
    }
}
\`\`\`

**채팅방 최신순 정렬 — displayIdx 선저장 방식**

채팅방 목록을 최신 메시지 기준으로 정렬할 때, 단순하게 구현하면 조회 시점에 채팅방마다 최신 메시지 타임스탬프를 서브쿼리로 집계해야 합니다.
채팅방 수가 N개라면 N번의 서브쿼리가 발생하는 구조입니다.

이를 해결하기 위해 \`UserChatRoom\` 테이블에 \`display_idx (LocalDateTime)\` 컬럼을 두고,
**메시지 전송 시점에 해당 채팅방의 모든 참여자 row를 한 번의 벌크 UPDATE로 갱신**하는 방식을 채택했습니다.

\`\`\`java
// 메시지 전송 시 — 쓰기 시점에 정렬 기준값 선저장
@Override
public void updateDisplayIdxByRoomId(Long roomId) {
    queryFactory
        .update(ucr)
        .set(ucr.displayIdx, LocalDateTime.now())  // 참여자 전원 일괄 갱신
        .where(ucr.room.id.eq(roomId))
        .execute();  // 벌크 연산, 1회 쿼리
}

// 채팅방 목록 조회 시 — 서브쿼리 없이 단순 SELECT
List<Tuple> myRooms = queryFactory
    .select(cr.id, ucr.customRoomName, ucr.displayIdx, ...)
    .from(ucr).join(ucr.room, cr)
    .where(ucr.user.id.eq(userId))
    .fetch();
// 클라이언트에서 displayIdx 기준으로 정렬
\`\`\`

이 방식으로 읽기(채팅 목록 조회) 시 정렬을 위한 서브쿼리가 완전히 제거됩니다.
쓰기(메시지 전송)에서 1회 벌크 UPDATE를 실행하는 trade-off를 통해 읽기 성능을 개선했습니다.

**안읽은 메시지 수 상한 300개 제한**

안읽은 메시지가 많을 경우 COUNT 쿼리 비용이 커질 수 있어, \`LIMIT 301\` 을 걸고 300을 초과하면 300으로 고정해 쿼리 비용을 제한했습니다.

\`\`\`java
Long count = queryFactory
    .select(cm.id.count())
    .from(cm)
    .where(cm.room.id.eq(roomId), cm.id.gt(lastReadMessageId), ...)
    .limit(MAX_UNREAD_MESSAGE_SHOW_COUNT + 1)  // 301개까지만 카운트
    .fetchOne();

return (int) Math.min(count, MAX_UNREAD_MESSAGE_SHOW_COUNT);  // 최대 300
\`\`\`

---

### 3. 결제 위변조 방지 + 자동 환불 처리

Toss Payments 결제 승인 요청 전 서버에 금액을 저장하고, 승인 후 비교 검증하는 플로우로 위변조를 방지합니다.
결제 승인 후 서버 내부 처리(포인트 충전, 이력 저장) 중 예외가 발생하면 즉시 자동 환불을 트리거합니다.

\`\`\`java
public PaymentConfirmToUserResponse confirmPayment(Long userId, ConfirmPaymentRequest request) {
    ResponseEntity<PaymentConfirmResponse> result = tossService.confirm(request);

    if (result.getStatusCode().is2xxSuccessful()) {
        try {
            User user = userRepository.findById(userId).orElseThrow(...);
            user.chargePoint(request.getAmount());
            paymentRepository.save(Payment.builder()
                .tossPaymentKey(result.getBody().getPaymentKey())
                .amount(result.getBody().getTotalAmount())
                ...
                .build());
            return PaymentConfirmToUserResponse.of(paymentHistory);

        } catch (Exception e) {
            // 내부 처리 실패 시 자동 환불
            tossService.cancelPayment(
                result.getBody().getPaymentKey(),
                result.getBody().getTotalAmount(),
                "결제 처리 중 오류 발생"
            );
        }
    }
    throw new PointException(ErrorCode.PAYMENT_PROCESS_ERROR);
}
\`\`\`

---

### 4. 동시성 제어 (낙관적 락 + 비관적 락)

**채팅 읽음 처리 — 낙관적 락 + 재시도**

여러 사용자가 동시에 메시지 읽음 상태를 업데이트할 때 충돌이 발생할 수 있습니다.
\`@Version\` 컬럼으로 낙관적 락을 걸고, 충돌 시 최대 100회까지 백오프 재시도합니다.

\`\`\`java
@Entity
public class ChatMessage {
    @Column(nullable = false)
    private Integer readCount;

    @Version
    private Long version; // 낙관적 락
}

@Service
@Async
@Transactional
public class AsyncChatMessageService {
    private static final int MAX_RETRY = 100;

    public void decreaseReadCounts(List<Long> messageIds) {
        List<ChatMessage> messages = chatMessageRepository.findAllByIdIn(messageIds);
        int retryCount = 0;

        while (retryCount++ < MAX_RETRY) {
            try {
                messages.forEach(m -> { if (m.getReadCount() > 0) m.readMessage(); });
                chatMessageRepository.saveAll(messages);
                return;
            } catch (ObjectOptimisticLockingFailureException e) {
                Thread.sleep(100); // 백오프 대기 후 재시도
            }
        }
    }
}
\`\`\`

**포인트 전송 — 비관적 락**

포인트 잔액 차감/적립은 정합성이 중요하므로, 조회 시점에 \`PESSIMISTIC_WRITE\` 락을 획득합니다.

\`\`\`java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT u FROM User u WHERE u.id = :id")
Optional<User> findByIdWithLock(@Param("id") Long userId);

// PointService
public CommonPointTransferResponse transferPoint(Long userId, PointTransferRequest request) {
    User sender = userRepository.findByIdWithLock(userId).orElseThrow(...);
    User receiver = userRepository.findByIdWithLock(request.getReceiverId()).orElseThrow(...);

    if (sender.getPoint() < request.getPointAmount()) {
        throw new PointException(ErrorCode.INSUFFICIENT_POINT_BALANCE);
    }

    sender.sendPoint(request.getPointAmount());
    receiver.receivePoint(request.getPointAmount());
}
\`\`\`


## 링크

[![](/icons/github.svg) littlebank-server](https://github.com/little-bank/littlebank-server)
`;

export const DEVHUB_CONTENT = `# <img src="/icons/devhub-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> DEVHUB

**기간:** 2024.07 ~ 2024.10 &nbsp;&nbsp; **유형:** 팀 프로젝트

> 프로젝트 형상관리 기능을 활용하기 어려워하는 초보 개발자들을 위한 프로젝트 형상관리 서비스

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

## 팀에서의 역할

1.PL을 맡아 팀원들의 코드를 피드백하고 GitHub를 활용하여 코드를 병합하는 업무를 담당했습니다.

2.프로젝트의 핵심 서비스인 형상관리 기능을 설계하고 개발하는 일을 담당했습니다.

## 주요 기여

### 1. 이메일 발신 기능 성능 개선

이메일 발신 기능이 동기 방식으로 처리되어 실제 서비스에서 치명적인 문제가 될 것이라고 판단, 비동기 방식으로 전환했습니다.

\`\`\`
개선 전: 4,159ms → 개선 후: 17ms  (응답 시간 99% 단축)
\`\`\`

- [![](/icons/tistory.png) 이메일 발신 기능 성능 개선 과정](https://taehyeon-stroy.tistory.com/49)

---

### 2. 형상관리 전략 설계 — Snapshot vs Git

유저 프로젝트를 서버에 저장하는 방식을 두고 두 전략을 비교 검토했습니다.

**Snapshot 방식**: 매 버전마다 전체 파일을 저장 → 디스크 용량 빠르게 소진
**Git 방식**: 변경분(diff)만 저장 → 용량 효율적, 최종 채택

- [![](/icons/notion.png) 형상관리 전략 결정 과정](https://wheat-eustoma-8a4.notion.site/4f6caacd19d746a5a77b2837725fd58c)

---

### 3. 동시 저장 방지

여러 팀원이 동시에 파일을 업로드할 경우 최초 1건만 저장되어야 하는데, 의도와 달리 모두 저장되는 문제가 발생했습니다.
DB 락을 적용하여 동시 요청에 의한 데이터 정합성 문제를 해결했습니다.

- [![](/icons/tistory.png) 동시 저장을 방지하는 방법](https://taehyeon-stroy.tistory.com/48)

---

### 4. AWS + Docker 배포

RDS 연동 및 EC2에 Docker로 스프링부트 프로젝트를 배포하는 과정을 경험했습니다.

- [![](/icons/tistory.png) AWS RDS 연동 과정](https://taehyeon-stroy.tistory.com/50)
- [![](/icons/tistory.png) EC2에 Docker로 배포하는 과정](https://taehyeon-stroy.tistory.com/51)

## 링크

- [![](/icons/github.svg) devhub-server](https://github.com/Devs-Of-Kosmo/devhub-server)
- [![](/icons/notion.png) 프로젝트 형상관리 서비스 DEVHUB](https://wheat-eustoma-8a4.notion.site/DEVHUB-40f17eb25bf84bd8ba87caa17c444d2b)
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

[![](/icons/github.svg) Board](https://github.com/Cupid-Arrow-team/Board/tree/develop)
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

- [![](/icons/github.svg) Front_Android](https://github.com/xogus3492/Front_Android)
- 📄 [Notion 문서](https://wheat-eustoma-8a4.notion.site/FYB-1402cd91589f4e5fb177c0e85b31d4c1)
`;
