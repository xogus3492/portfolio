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

### 2. WebSocket 기반 실시간 채팅 + JWT 인증 처리

STOMP 프로토콜 위에서 WebSocket 연결 시 JWT 토큰을 검증하는 채널 인터셉터를 구현했습니다.
HTTP 필터가 아닌 STOMP \`CONNECT\` 커맨드 단계에서 인증을 처리해 WebSocket 연결 자체를 보호합니다.

\`\`\`java
@Component
public class StompChannelInterceptor implements ChannelInterceptor {
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String bearerToken = accessor.getFirstNativeHeader("Authorization");
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                String token = bearerToken.substring(7);
                if (tokenProvider.validateToken(token)) {
                    accessor.setUser(tokenProvider.getAuthentication(token));
                }
            }
        }
        return message;
    }
}
\`\`\`

메시지 전송 시에는 채팅방 참여자를 조회해 각 사용자의 개인 구독 경로로 라우팅합니다.
차단된 사용자에게는 메시지가 전달되지 않도록 처리했습니다.

\`\`\`java
@MessageMapping("/chat-send")
public void sendMessage(@Payload ChatMessageRequest request, Authentication authentication) {
    ChatMessage saved = chatMessageService.saveMessage(userDetails.getId(), request);
    List<UserChatRoom> participants = chatMessageService.getChatRoomParticipants(request.getRoomId());

    for (UserChatRoom participant : participants) {
        if (participant.getUser().getId().equals(userDetails.getId())) continue;

        Friend friend = friendService.findFriend(participant.getUser().getId(), userDetails.getId());
        if (room.getRange() == RoomRange.PRIVATE && friend != null && friend.getIsBlocked()) continue;

        // 참여자별 개인 구독 경로로 라우팅
        messagingTemplate.convertAndSend(
            "/sub/chat/" + request.getRoomId() + "/" + participant.getUser().getId(),
            SocketMessageResponse.of(participant, saved, friend)
        );
    }
}
\`\`\`

채팅방 목록 조회 시 클라이언트에서 처리하던 정렬·읽음 상태 계산을 서버 QueryDSL 쿼리로 이동시켜
BFF(Backend For Frontend) 관점에서 클라이언트 부하를 줄였습니다.

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

---

### 5. Redis 기반 로그아웃 관리

JWT는 서버 측에서 무효화할 수 없는 구조이므로, Refresh 토큰을 Redis에 저장하고
로그아웃 시 삭제해 재사용을 차단합니다. 필터에서 Redis에 토큰이 존재하는지 확인해 로그아웃된 사용자를 막습니다.

\`\`\`java
// JwtFilter.java
String refreshToken = cookieUtil.getCookieValue(request);
if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
    String loginUserKey = RedisPolicy.LOGIN_USER_KEY_PREFIX
        + tokenProvider.getAuthentication(refreshToken).getName();

    // Redis에 저장된 토큰과 불일치 = 로그아웃된 사용자
    if (!redisDao.existData(loginUserKey)
            || !refreshToken.equals(redisDao.getValues(loginUserKey))) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        return;
    }
}
\`\`\`

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
