# 사용자 조회 API 문서

## 1. 디바이스 ID로 사용자 조회 또는 자동 등록

### **GET** `/api/user/device/:device_id`

디바이스 ID를 사용하여 사용자 정보를 조회합니다. 사용자가 없으면 자동으로 등록합니다.

#### 요청

**URL 파라미터:**
- `device_id` (string, 필수): 디바이스 고유 ID

**예시:**
```
GET /api/user/device/my-device-123
```

#### 응답

**성공 응답 (200):**
```json
{
  "data": {
    "user_id": "ABC12345",
    "device_id": "my-device-123",
    "nickname": "사용자1703123456789",
    "create_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "사용자 정보를 조회했습니다",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**에러 응답 (400):**
```json
{
  "message": "디바이스 ID는 필수입니다",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**에러 응답 (500):**
```json
{
  "message": "서버 내부 오류가 발생했습니다",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 동작 방식

1. **기존 사용자가 있는 경우**: 사용자 정보 반환
2. **사용자가 없는 경우**: 자동으로 새 사용자 등록 후 반환
3. **삭제된 사용자인 경우**: 자동으로 새 사용자 등록 후 반환

#### 특징

- **자동 등록**: 사용자가 없으면 자동으로 등록
- **닉네임 자동 생성**: `사용자{타임스탬프}` 형식
- **중복 방지**: 같은 디바이스 ID로 중복 등록 방지
- **보안**: `is_deleted` 필드는 응답에 포함되지 않음

---

## 2. 사용자 ID로 조회

### **GET** `/api/user/:user_id`

사용자 ID를 사용하여 사용자 정보를 조회합니다.

#### 요청

**URL 파라미터:**
- `user_id` (string, 필수): 사용자 고유 ID

**예시:**
```
GET /api/user/ABC12345
```

#### 응답

**성공 응답 (200):**
```json
{
  "data": {
    "user_id": "ABC12345",
    "device_id": "my-device-123",
    "nickname": "사용자1703123456789",
    "create_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "사용자 정보를 조회했습니다",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**에러 응답 (404):**
```json
{
  "message": "해당 사용자를 찾을 수 없습니다",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**에러 응답 (500):**
```json
{
  "message": "서버 내부 오류가 발생했습니다",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 동작 방식

1. **사용자 존재**: 사용자 정보 반환
2. **사용자 없음**: 404 에러 반환
3. **삭제된 사용자**: 404 에러 반환 (삭제된 사용자는 조회되지 않음)

#### 특징

- **정확한 조회**: 사용자 ID로 정확한 사용자 조회
- **삭제된 사용자 제외**: `is_deleted`가 `true`인 사용자는 조회되지 않음
- **보안**: `is_deleted` 필드는 응답에 포함되지 않음

---

## 사용 예시

### 프론트엔드에서의 사용

```javascript
// 1. 디바이스 ID로 조회 (자동 등록 포함)
const response = await fetch('/api/user/device/my-device-123');
const userData = await response.json();

if (response.ok) {
  console.log('사용자 정보:', userData.data);
  // userData.data.user_id, device_id, nickname, create_at 사용 가능
} else {
  console.error('에러:', userData.message);
}

// 2. 사용자 ID로 조회
const response2 = await fetch('/api/user/ABC12345');
const userData2 = await response2.json();

if (response2.ok) {
  console.log('사용자 정보:', userData2.data);
} else if (response2.status === 404) {
  console.log('사용자를 찾을 수 없습니다');
} else {
  console.error('에러:', userData2.message);
}
```

### 권장 사용법

- **새 사용자 등록**: `GET /api/user/device/:device_id` 사용 (자동 등록)
- **기존 사용자 조회**: `GET /api/user/:user_id` 사용 (정확한 조회)
- **디바이스 기반 앱**: `GET /api/user/device/:device_id`를 메인으로 사용
