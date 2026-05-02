export const RUNDOMMATE_CONTENT = `# <img src="/icons/rdm-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> 런덤메이트 (RUNDOMMATE)

**기간:** 2026.02 ~ 진행중 &nbsp;&nbsp; **유형:** 팀 프로젝트 &nbsp;&nbsp; **출시:** 2026년 3분기 출시 예정

## 팀 구성 & 역할

| 구성 | 역할 |
|------|------|
| PM 1명, Full-stack 1명, Front-end 2명, Back-end 1명, Design 2명 | **Full-stack (Infra · Backend · Web)** |

## 서비스 소개

> **런덤메이트**는 러너들이 크루를 만들고, 함께 달리며 성장할 수 있는 러닝 커뮤니티 플랫폼입니다.
>
> 런덤메이트에서는 매칭 시스템을 통해 현재 위치를 기반으로 주변의 런덤메이트 유저를 탐색하고, 함께 러닝할 메이트를 제안받을 수 있습니다.
>
> 또한 GPS 기반 코스 추천, 실시간 위치 공유, 크루 피드, 채팅 등 러닝 라이프사이클 기능을 지원합니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Java 17, Spring Boot 3.4, Spring Security, JPA, PostGIS |
| Database | PostgreSQL 16, Redis |
| Infra | AWS (ECS Fargate, RDS, ElastiCache, ALB, ECR, Route53, Secrets Manager) |
| IaC | Terraform (dev / prod 환경 분리) |
| CI/CD | GitHub Actions |
| Real-time | WebSocket (STOMP), FCM |
| Web Admin | Next.js 16, TypeScript, Tailwind CSS v4, Zustand, Recharts |

---

## 인프라 — Terraform IaC로 AWS 풀스택 설계

직접 설계한 AWS 아키텍처를 Terraform으로 코드화하여 dev / prod 두 환경을 선언적으로 관리합니다.

### VPC 네트워크 설계

환경별 네트워크 전략을 다르게 가져갔습니다.
개발 환경은 비용 절감을 위해 Public 서브넷에 ECS를 배치하고 NAT Gateway를 제거했고,
프로덕션은 ECS를 Private 서브넷에 격리하고 VPC Endpoints를 통해 NAT 데이터 전송 비용을 절감했습니다.

\`\`\`hcl
# infra/server/vpc.tf
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + length(var.availability_zones))
  availability_zone = var.availability_zones[count.index]
}

# Prod: ECR 이미지 pull 시 NAT 우회 → 데이터 전송 비용 절감
resource "aws_vpc_endpoint" "ecr_dkr" {
  count               = var.enable_vpc_endpoints ? 1 : 0
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.\${var.aws_region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
}
\`\`\`

### ECS Fargate + Auto Scaling

컨테이너 기반 무중단 배포 환경을 구성했습니다.
CPU / Memory 임계치 기반으로 태스크를 2~10개 사이에서 자동 스케일링합니다.

\`\`\`hcl
# infra/server/ecs.tf
resource "aws_appautoscaling_policy" "cpu" {
  name               = "\${local.prefix}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
\`\`\`

### CI/CD — GitHub Actions → ECR → ECS 무중단 배포

\`server/**\` 경로 변경이 감지되면 자동으로 빌드 → 이미지 푸시 → ECS 롤링 업데이트가 진행됩니다.
민감 정보는 GitHub Secrets에서 AWS Secrets Manager로 이관하여 코드 노출을 방지했습니다.

\`\`\`yaml
# .github/workflows/deploy-dev.yml
jobs:
  deploy:
    steps:
      - name: Build & Push to ECR
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: kosmo-dev-backend-service
          cluster: kosmo-dev-cluster
          wait-for-service-stability: true
\`\`\`

#### 인프라 Terraform Plan도 자동화
\`infra/**\` 변경 시 GitHub Actions가 \`terraform plan\`을 실행하고 결과를 PR 코멘트로 표시합니다.
PR 머지 시에만 \`terraform apply\`가 실행되어 인프라 변경을 리뷰 기반으로 제어합니다.

---

## 백엔드 — Firebase Cloud Messaging(FCM) 푸시 알림 구현

Firebase Admin SDK를 연동하여 앱 푸시 알림 발송 로직을 담당했습니다.

알림 타입(댓글, 크루 피드, 크루 일정 등)별로 FCM 메시지를 구성하고, 수신자의 알림 수신 설정(게시판 / 크루 / 러닝 카테고리)을 확인한 뒤 조건을 만족하는 기기 토큰에만 발송하도록 설계했습니다. 전체 유저 대상 브로드캐스트는 카테고리 수신 설정을 DB 쿼리 레벨에서 필터링하여 불필요한 발송을 방지했습니다.

앱 화면 이동을 위한 딥링크 정보는 FCM \`data\` 필드에 포함하고, 알림 타입으로 카테고리를 자동 분류해 Android / iOS 양쪽에서 동일하게 처리할 수 있도록 구조를 잡았습니다.

또한 ECS 컨테이너 환경에서 Firebase 서비스 계정 JSON을 파일로 배포하기 어렵고 Git에 포함해서도 안 되는 문제가 있어, AWS Secrets Manager에서 환경변수로 주입받도록 인증 방식을 전환했습니다.

---

## 어드민 시스템 — 운영 관리 대시보드

Next.js App Router로 구축한 백오피스 웹 서비스입니다.

![어드민 대시보드](/screenshots/rdm-admin.png)

### 대시보드

Recharts 기반으로 서비스 현황을 시각화했습니다.
- 권한별 사용자 수 Pie Chart (ADMIN / MANAGER / NORMAL_USER / GUEST)
- KPI 카드: 활성 사용자, 러닝 세션, 미처리 신고 건수

### 러닝 세션 관리

- **이상 세션 감지 & 하이라이트**: 비정상적으로 긴 거리·시간 세션을 자동 감지해 목록에서 강조 표시
- **수동입력 vs GPS 비율 카드**: 세션 유형별 건수와 비율을 카드·배지 형태로 시각화, 필터로 유형별 목록 전환
- **러닝 경로 지도 시각화**: 세션 상세 모달에서 GPS 포인트를 지도에 렌더링
- **사용자별 통계 탭**: username으로 특정 유저의 누적 거리·횟수 분석

### 신고 관리

신고자·피신고자의 username과 fullName으로 키워드 검색을 지원하며,
목록에서 바로 승인/거절 처리할 수 있습니다.

### 메일 발송 UI

- **레이아웃 선택 + 비주얼 에디터**: 단순 텍스트 / 헤더+본문 레이아웃을 선택한 뒤 폼으로 편집
- **수신자 선택 모달**: 체크박스 + 전체선택 + 페이지네이션으로 특정 유저를 직접 선택
- **발송 내역**: 발송 후 즉시 내역 갱신, 성공/실패 통계 확인

### 대회 관리

수동 대회 등록 폼(외부 링크·정보 입력)과, 등록 시 게시글 자동 발행 여부 선택 UI를 구현했습니다.
이미 저장된 대회의 게시글 수동 발행 기능도 추가했습니다.

### 운영 환경 보안

운영 환경에서 어드민·TMS 페이지 경로를 난독화하고 접근을 차단했습니다.
미들웨어에서 환경별로 경로를 분기하여 불필요한 노출을 방지했습니다.

각 탭마다 기능 설명 가이드 모달을 추가해 운영자가 기능을 빠르게 파악할 수 있도록 했습니다.

---

## TMS — 테스트 관리 시스템

팀 내 QA 프로세스를 체계화하기 위해 백엔드와 프론트를 모두 직접 설계·구현했습니다.

![TMS 결함 상세](/screenshots/rdm-tms-1.png)

![TMS 결함 조치내용](/screenshots/rdm-tms-2.png)

결함 등록부터 조치 확인까지 하나의 흐름으로 관리됩니다.

1. **결함 등록 (접수)** — 등록자가 담당자를 지정하여 결함을 등록하면 상태가 **접수**로 시작됩니다.
2. **조치 (조치중)** — 담당자가 결함 내용을 확인하고 원인 분석·조치를 진행하면 상태가 **조치중**으로 업데이트됩니다. 조치가 완료되면 조치 내용을 작성하고 **조치완료** 상태로 전환합니다.
3. **확인 (확인완료)** — 등록자가 조치 내용을 검토하고 정상 처리됐다고 판단하면 **확인완료**로 최종 마감합니다.

각 단계마다 상태 변경 이력이 자동으로 기록되어, 누가 언제 어떤 상태로 변경했는지 추적할 수 있습니다.
`;

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
| App(PM) 1명, Back-end 2명, Design 1명 | **Back-end, Project Leader** |

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
| Front-end 2명, Back-end 3명 | **Back-end, Project Leader** |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Spring Boot, JPA, Spring Security, JWT |
| Database | MySQL, Redis |
| Infra | Nginx, Docker, AWS |

## 팀에서의 역할

1.Project Leader를 맡아 팀원들의 코드를 피드백하고 GitHub를 활용하여 코드를 병합하는 업무를 담당했습니다.

2.프로젝트의 핵심 서비스인 형상관리 기능을 설계하고 개발하는 일을 담당했습니다.

## 주요 기여

### 1. 이메일 발신 기능 성능 개선

이메일 발신 기능이 동기 방식으로 처리되어 실제 서비스에서 치명적인 문제가 될 것이라고 판단, 비동기 방식으로 전환했습니다.

\`\`\`
개선 전: 4,159ms → 개선 후: 17ms  (응답 시간 99% 단축)
\`\`\`

- [![](/icons/tistory.svg) 이메일 발신 기능 성능 개선 과정](https://taehyeon-stroy.tistory.com/49)

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

- [![](/icons/tistory.svg) 동시 저장을 방지하는 방법](https://taehyeon-stroy.tistory.com/48)

---

### 4. AWS + Docker 배포

RDS 연동 및 EC2에 Docker로 스프링부트 프로젝트를 배포하는 과정을 경험했습니다.

- [![](/icons/tistory.svg) AWS RDS 연동 과정](https://taehyeon-stroy.tistory.com/50)
- [![](/icons/tistory.svg) EC2에 Docker로 배포하는 과정](https://taehyeon-stroy.tistory.com/51)

## 링크

- [![](/icons/github.svg) devhub-server](https://github.com/Devs-Of-Kosmo/devhub-server)
- [![](/icons/notion.png) 프로젝트 형상관리 서비스 DEVHUB](https://wheat-eustoma-8a4.notion.site/DEVHUB-40f17eb25bf84bd8ba87caa17c444d2b)
`;

export const BOARD_CONTENT = `# <img src="/icons/board-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> 게시판 프로젝트

**기간:** 2023.03 ~ 2023.05 &nbsp;&nbsp; **유형:** 팀 프로젝트

> 다양한 기술 활용과 코드 디자인, 코드 리뷰를 통한 서비스 최적화 과정으로 실무 프로젝트 수준의 개발을 목표로 진행한 프로젝트

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

### 1. JPA N+1 문제

게시글 조회 시 연관관계 설정된 태그 엔티티를 사용하는 과정에서 태그 엔티티에 대한 N만큼의 추가 쿼리가 발생하는 현상을 발견했습니다.
\`@Query\` 어노테이션과 JPQL로 태그 엔티티를 **Fetch Join** 하여 N+1개 → 1개 쿼리로 최적화했습니다.

[![](/icons/tistory.svg) N+1 문제 트러블 슈팅](https://taehyeon-stroy.tistory.com/5)

---

### 2. 게시글 좋아요 기능 동시성 문제

여러 Thread가 동시에 좋아요 API 요청을 보냈을 때 예상한 결과와 다르다는 것을 파악했습니다.
**JMeter** 부하 테스트로 동시성 문제를 재현하고, 해당 레코드에 **비관적 락(Pessimistic Lock)** 을 적용하여 데이터 정합성을 보장했습니다.

[![](/icons/tistory.svg) 좋아요 기능 동시성 문제 트러블 슈팅](https://taehyeon-stroy.tistory.com/6)

## 링크

- [![](/icons/github.svg) Board](https://github.com/Cupid-Arrow-team/Board/tree/develop)
`;

export const FYB_CONTENT = `# <img src="/icons/fyb-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> FYB (Fit Your Balance)

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

## 담당한 부분

안드로이드 애플리케이션 구현

- Retrofit2 기반 REST API 클라이언트 구현
- OkHttp3 인터셉터를 활용한 공통 헤더 처리
- Gson을 사용한 JSON 직렬화/역직렬화 처리
- 빅데이터 추천 결과를 Android UI에 연동

## 앱 화면 구성

![FYB 앱 화면](https://github.com/xogus3492/Front_Android/assets/77439799/2070fa63-7ce0-4a0a-9d47-be6700323102)

## 링크

- [![](/icons/github.svg) Front_Android](https://github.com/xogus3492/Front_Android)
- [![](/icons/notion.png) 맞춤형 쇼핑몰 추천 서비스 FYB](https://wheat-eustoma-8a4.notion.site/FYB-1402cd91589f4e5fb177c0e85b31d4c1)
`;

export const RUNDOMMATE_CONTENT_EN = `# <img src="/icons/rdm-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> 런덤메이트 (RUNDOMMATE)

**Period:** 2026.02 ~ Present &nbsp;&nbsp; **Type:** Team Project &nbsp;&nbsp; **Launch:** Q3 2026

## Team & Role

| Composition | Role |
|-------------|------|
| PM ×1, Full-stack ×1, Front-end ×2, Back-end ×1, Design ×2 | **Full-stack (Infra · Backend · Web)** |

## Service Overview

> **RUNDOMMATE** is a running community platform where runners can form crews, run together, and grow.
>
> The matching system lets users explore nearby RUNDOMMATE users based on their current location and receive suggestions for running mates.
> GPS-based course recommendations, real-time location sharing, crew feeds, and chat cover the full running lifecycle.

## Tech Stack

| Area | Technologies |
|------|-------------|
| Backend | Java 17, Spring Boot 3.4, Spring Security, JPA, PostGIS |
| Database | PostgreSQL 16, Redis |
| Infra | AWS (ECS Fargate, RDS, ElastiCache, ALB, ECR, Route53, Secrets Manager) |
| IaC | Terraform (dev / prod environments) |
| CI/CD | GitHub Actions |
| Real-time | WebSocket (STOMP), FCM |
| Web Admin | Next.js 16, TypeScript, Tailwind CSS v4, Zustand, Recharts |

---

## Infrastructure — Full AWS Stack with Terraform IaC

I designed the AWS architecture and managed it declaratively as code via Terraform, with separate dev and prod environments.

### VPC Network Design

The network strategy differs by environment.
Dev places ECS in public subnets without a NAT Gateway to minimize cost.
Prod isolates ECS in private subnets and uses VPC Endpoints to reduce NAT data transfer costs.

\`\`\`hcl
# infra/server/vpc.tf
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + length(var.availability_zones))
  availability_zone = var.availability_zones[count.index]
}

# Prod: bypass NAT when pulling ECR images → reduces data transfer cost
resource "aws_vpc_endpoint" "ecr_dkr" {
  count               = var.enable_vpc_endpoints ? 1 : 0
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.\${var.aws_region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
}
\`\`\`

### ECS Fargate + Auto Scaling

Container-based zero-downtime deployment.
Tasks auto-scale between 2 and 10 based on CPU / Memory thresholds.

\`\`\`hcl
# infra/server/ecs.tf
resource "aws_appautoscaling_policy" "cpu" {
  name               = "\${local.prefix}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
\`\`\`

### CI/CD — GitHub Actions → ECR → ECS Zero-Downtime Deployment

Changes to \`server/**\` automatically trigger build → image push → ECS rolling update.
Sensitive credentials are injected from AWS Secrets Manager to prevent code exposure.

\`\`\`yaml
# .github/workflows/deploy-dev.yml
jobs:
  deploy:
    steps:
      - name: Build & Push to ECR
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: kosmo-dev-backend-service
          cluster: kosmo-dev-cluster
          wait-for-service-stability: true
\`\`\`

#### Terraform Plan Automation
On changes to \`infra/**\`, GitHub Actions runs \`terraform plan\` and posts the result as a PR comment.
\`terraform apply\` only runs on PR merge, keeping infra changes review-gated.

---

## Backend — Firebase Cloud Messaging (FCM) Push Notifications

I integrated the Firebase Admin SDK and implemented the app push notification dispatch logic.

FCM messages are composed per notification type (comments, crew feeds, crew schedules, etc.). Before sending, the recipient's notification preferences (Board / Crew / Running categories) are checked, and the message is delivered only to eligible device tokens. Broadcasts to all users filter by category preference at the DB query level to prevent unnecessary sends.

Deep-link data for in-app navigation is included in the FCM \`data\` field, with the notification type used to auto-classify the category so both Android and iOS handle it consistently.

Since Firebase service account JSON cannot be bundled into the ECS container or committed to Git, I switched the auth approach to inject credentials via an AWS Secrets Manager environment variable.

---

## Admin System — Operations Dashboard

A back-office web service built with Next.js App Router.

![Admin Dashboard](/screenshots/rdm-admin.png)

### Dashboard

Service status visualized with Recharts.
- User count by role Pie Chart (ADMIN / MANAGER / NORMAL_USER / GUEST)
- KPI cards: active users, running sessions, pending reports

### Running Session Management

- **Anomaly Detection & Highlight**: Sessions with abnormally long distance/duration are auto-detected and highlighted in the list
- **Manual vs GPS Ratio Card**: Session type counts and ratios visualized as cards/badges, with a filter to switch between types
- **Route Map Visualization**: GPS points rendered on a map in the session detail modal
- **Per-User Stats Tab**: Analyze cumulative distance and session count for a specific user by username

### Report Management

Keyword search by reporter/reported user's username or fullName, with approve/reject actions directly from the list.

### Mail Dispatch UI

- **Layout Selector + Visual Editor**: Choose a simple text or header+body layout and edit via form
- **Recipient Selection Modal**: Select specific users with checkboxes, select-all, and pagination
- **Send History**: History updates immediately after sending, with success/failure stats

### Competition Management

Manual competition registration form (external link + details) with an option to auto-publish a post on registration.
Manual post publication for already-saved competitions is also supported.

### Production Security

Admin and TMS page paths are obfuscated and access-blocked in production.
The middleware branches by environment to prevent unnecessary exposure.

A guide modal explaining each tab's functionality is added to help operators get up to speed quickly.

---

## TMS — Test Management System

An in-house test management tool designed and implemented end-to-end (backend + frontend) to systematize the team's QA process.

![TMS Defect Detail](/screenshots/rdm-tms-1.png)

![TMS Defect Resolution](/screenshots/rdm-tms-2.png)

The entire flow from defect registration to resolution confirmation is managed in one place.

1. **Registration (Received)** — The reporter assigns a handler and registers a defect; the status starts as **Received**.
2. **Resolution (In Progress)** — The handler reviews the defect, analyzes the cause, and works on a fix; the status updates to **In Progress**. On completion, the handler records the resolution notes and transitions to **Resolved**.
3. **Confirmation (Confirmed)** — The reporter reviews the resolution and, if satisfied, closes it as **Confirmed**.

A status change history is automatically recorded at each step so you can track who changed what and when.
`;

export const REHAB_CENTER_CONTENT_EN = `# <img src="/icons/house-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> 재활센터 홈페이지 (Rehab Center Website)

**Period:** 2026.01 ~ Present &nbsp;&nbsp; **Type:** Individual Project (Freelance)

> Freelance website development project

## Tech Stack

| Area | Technologies |
|------|-------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, ESLint |
| Tools | Cursor, Vercel |

## Achievements

- **Automated Workflow with Notion MCP Server**
  - Client writes RFP in Notion → Agent detects new requirements → Validates and reflects in source code
  - Automated requirement change response process to improve development productivity

## Links

- [![](/icons/github.svg) sm-rehabilitation-center-website](https://github.com/xogus3492/sm-rehabilitation-center-website)
- 🌐 [Live Site](https://sm-rehabilitation-center.vercel.app/)
`;

export const LITTLE_BANK_CONTENT_EN = `# <img src="/icons/littlebank-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> 리틀뱅크 (LittleBank)

**Period:** 2025.03 ~ 2025.07 &nbsp;&nbsp; **Type:** Team Project

## Team & Role

| Composition | Role |
|-------------|------|
| App(PM) ×1, Back-end ×2, Design ×1 | **Back-end, Project Leader** |

## Service Overview

> **LittleBank** is an app that motivates children to study by rewarding them when they complete learning missions set by their parents.
>
> Parent users can link with their child's account to monitor goals, set missions, and track achievements.

## System Architecture

![CI/CD Architecture](https://github.com/user-attachments/assets/37f4dbdb-5424-49b0-84a6-c40dbfecb4ab)

## Tech Stack

| Area | Technologies |
|------|-------------|
| Backend | Java 17, Spring Boot 3.x, Spring Security, JPA, QueryDSL |
| Database | MySQL 8.0, Redis |
| Infra | AWS, Docker, Nginx |
| CI/CD | GitHub Actions, CodeDeploy |
| External | Firebase, Amazon S3 |
| Real-time | WebSocket (STOMP) |
| Docs | Swagger |

## Key Achievements

### 1. CI/CD Pipeline Setup

Set trigger conditions so deployment only runs when PRs are **merged** into \`develop\` / \`main\`, and configured the pipeline as GitHub Actions → S3 upload → AWS CodeDeploy.
Config files are Base64-encoded in GitHub Secrets and restored at runtime to keep them out of the repo.

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

Docker multi-stage build separates the build and runtime environments to minimize the final image size.

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

### 2. Real-time Chat with WebSocket

**STOMP CONNECT-stage JWT Authentication**

JWT is validated at the STOMP \`CONNECT\` command stage rather than in the HTTP filter chain.
Since HTTP filters don't run after the initial WebSocket upgrade, the channel interceptor protects the connection itself.

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

**Chat Room Latest-First Ordering — Pre-stored displayIdx**

When sorting chat rooms by the latest message, a naive approach requires a subquery per room to aggregate the latest message timestamp — N subqueries for N rooms.

To solve this, a \`display_idx (LocalDateTime)\` column is added to the \`UserChatRoom\` table and **bulk-updated for all participants in a single UPDATE** at message send time.

\`\`\`java
// On message send — pre-store sort key at write time
@Override
public void updateDisplayIdxByRoomId(Long roomId) {
    queryFactory
        .update(ucr)
        .set(ucr.displayIdx, LocalDateTime.now())
        .where(ucr.room.id.eq(roomId))
        .execute();
}

// On room list fetch — simple SELECT, no subquery
List<Tuple> myRooms = queryFactory
    .select(cr.id, ucr.customRoomName, ucr.displayIdx, ...)
    .from(ucr).join(ucr.room, cr)
    .where(ucr.user.id.eq(userId))
    .fetch();
\`\`\`

This eliminates sort subqueries at read time, trading one bulk UPDATE per message send for improved read performance.

**Unread Message Count Capped at 300**

To limit COUNT query cost for large unread counts, a \`LIMIT 301\` is applied and the result is capped at 300.

\`\`\`java
Long count = queryFactory
    .select(cm.id.count())
    .from(cm)
    .where(cm.room.id.eq(roomId), cm.id.gt(lastReadMessageId), ...)
    .limit(MAX_UNREAD_MESSAGE_SHOW_COUNT + 1)
    .fetchOne();

return (int) Math.min(count, MAX_UNREAD_MESSAGE_SHOW_COUNT);
\`\`\`

---

### 3. Payment Forgery Prevention + Auto Refund

The server stores the amount before calling the Toss Payments approval API and compares after approval to prevent tampering.
If an exception occurs during internal processing (point charge, history save) after approval, an immediate auto-refund is triggered.

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
            tossService.cancelPayment(
                result.getBody().getPaymentKey(),
                result.getBody().getTotalAmount(),
                "Error during payment processing"
            );
        }
    }
    throw new PointException(ErrorCode.PAYMENT_PROCESS_ERROR);
}
\`\`\`

---

### 4. Concurrency Control (Optimistic + Pessimistic Lock)

**Chat Read Status — Optimistic Lock + Retry**

When multiple users concurrently update message read status, conflicts can arise.
An \`@Version\` column applies optimistic locking, with up to 100 backoff retries on conflict.

\`\`\`java
@Entity
public class ChatMessage {
    @Column(nullable = false)
    private Integer readCount;

    @Version
    private Long version;
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
                Thread.sleep(100);
            }
        }
    }
}
\`\`\`

**Point Transfer — Pessimistic Lock**

Since point balance debit/credit requires strict consistency, a \`PESSIMISTIC_WRITE\` lock is acquired at query time.

\`\`\`java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT u FROM User u WHERE u.id = :id")
Optional<User> findByIdWithLock(@Param("id") Long userId);

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


## Links

[![](/icons/github.svg) littlebank-server](https://github.com/little-bank/littlebank-server)
`;

export const DEVHUB_CONTENT_EN = `# <img src="/icons/devhub-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> DEVHUB

**Period:** 2024.07 ~ 2024.10 &nbsp;&nbsp; **Type:** Team Project

> A project version control service for beginner developers who find it difficult to use source code management tools

## Team & Role

| Composition | Role |
|-------------|------|
| Front-end ×2, Back-end ×3 | **Back-end, Project Leader** |

## Tech Stack

| Area | Technologies |
|------|-------------|
| Backend | Spring Boot, JPA, Spring Security, JWT |
| Database | MySQL, Redis |
| Infra | Nginx, Docker, AWS |

## Team Contributions

1. As Project Leader, I reviewed teammates' code and managed code merging via GitHub.

2. I designed and developed the core version control feature of the project.

## Key Contributions

### 1. Email Dispatch Performance Improvement

The synchronous email dispatch was identified as a critical bottleneck in production, so it was refactored to asynchronous processing.

\`\`\`
Before: 4,159ms → After: 17ms  (99% reduction in response time)
\`\`\`

- [![](/icons/tistory.svg) Email dispatch performance improvement process](https://taehyeon-stroy.tistory.com/49)

---

### 2. Version Control Strategy — Snapshot vs Git

Two strategies were evaluated for storing user project files on the server.

**Snapshot approach**: Stores all files for every version → disk usage grows rapidly
**Git approach**: Stores only diffs → space-efficient, adopted

- [![](/icons/notion.png) Version control strategy decision process](https://wheat-eustoma-8a4.notion.site/4f6caacd19d746a5a77b2837725fd58c)

---

### 3. Concurrent Save Prevention

When multiple team members upload files simultaneously, only the first save should succeed — but all were being saved unexpectedly.
DB locking was applied to resolve data integrity issues from concurrent requests.

- [![](/icons/tistory.svg) How to prevent concurrent saves](https://taehyeon-stroy.tistory.com/48)

---

### 4. AWS + Docker Deployment

Experienced connecting RDS and deploying a Spring Boot project on EC2 with Docker.

- [![](/icons/tistory.svg) AWS RDS connection process](https://taehyeon-stroy.tistory.com/50)
- [![](/icons/tistory.svg) Deploying with Docker on EC2](https://taehyeon-stroy.tistory.com/51)

## Links

- [![](/icons/github.svg) devhub-server](https://github.com/Devs-Of-Kosmo/devhub-server)
- [![](/icons/notion.png) Project Version Control Service DEVHUB](https://wheat-eustoma-8a4.notion.site/DEVHUB-40f17eb25bf84bd8ba87caa17c444d2b)
`;

export const BOARD_CONTENT_EN = `# <img src="/icons/board-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> 게시판 프로젝트 (Board Project)

**Period:** 2023.03 ~ 2023.05 &nbsp;&nbsp; **Type:** Team Project

> A project aimed at production-level development through diverse technologies, code design, and code reviews for service optimization

## Team & Role

| Composition | Role |
|-------------|------|
| Leader ×1, Back-end ×2 | **Back-end** |

## Tech Stack

| Area | Technologies |
|------|-------------|
| Backend | Spring Boot, JPA, Querydsl |
| Database | H2, Redis |

## Troubleshooting

### 1. JPA N+1 Problem

When fetching posts, N additional queries were firing for the associated tag entities.
Used \`@Query\` with JPQL **Fetch Join** to reduce N+1 queries to a single query.

[![](/icons/tistory.svg) N+1 problem troubleshooting](https://taehyeon-stroy.tistory.com/5)

---

### 2. Post Like Concurrency Issue

Concurrent API requests from multiple threads produced unexpected results.
Reproduced the concurrency issue with **JMeter** load testing, then applied **Pessimistic Lock** on the record to ensure data integrity.

[![](/icons/tistory.svg) Post like concurrency troubleshooting](https://taehyeon-stroy.tistory.com/6)

## Links

- [![](/icons/github.svg) Board](https://github.com/Cupid-Arrow-team/Board/tree/develop)
`;

export const FYB_CONTENT_EN = `# <img src="/icons/fyb-icon.png" style="display:inline;height:1em;vertical-align:middle;margin-right:0.35em;" /> FYB (Fit Your Balance)

**Period:** 2022.03 ~ 2022.11 &nbsp;&nbsp; **Type:** Team Project

> A big-data-based personalized shopping mall recommendation service

## Team & Role

| Composition | Role |
|-------------|------|
| Back-end ×1, Android ×1, Design ×2 | **Android** |

## Tech Stack

| Area | Technologies |
|------|-------------|
| Mobile | Android, Java |
| Network | Retrofit2, OkHttp3, Gson |

## Responsibilities

Android application implementation

- REST API client implementation based on Retrofit2
- Common header handling via OkHttp3 interceptor
- JSON serialization/deserialization with Gson
- Connecting big-data recommendation results to the Android UI

## App Screenshots

![FYB App Screen](https://github.com/xogus3492/Front_Android/assets/77439799/2070fa63-7ce0-4a0a-9d47-be6700323102)

## Links

- [![](/icons/github.svg) Front_Android](https://github.com/xogus3492/Front_Android)
- [![](/icons/notion.png) Personalized Shopping Mall Recommendation Service FYB](https://wheat-eustoma-8a4.notion.site/FYB-1402cd91589f4e5fb177c0e85b31d4c1)
`;
