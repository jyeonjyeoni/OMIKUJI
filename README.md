# 御神籤 — 오늘의 오미쿠지

NFC 오마모리로 여는 모바일 오미쿠지. 종이를 펼치면 오늘의 등급과 여덟 분야의 조언이 나타납니다. HTML·CSS·JavaScript·자체 JSON만 사용하며 외부 API, LLM, 회원가입, 외부 폰트, 분석 스크립트가 없습니다.

## 접속

- 확장판: https://jyeonjyeoni.github.io/OMIKUJI/
- 부적 주소 예시: https://jyeonjyeoni.github.io/OMIKUJI/?id=7K3P9D
- 보존한 초기 버전: https://jyeonjyeoni.github.io/OMIKUJI/v1/?id=7K3P9D

ID 없는 주소는 체험용입니다. 실제 부적은 서로 다른 무작위 ID를 정해 NDEF URL로 기록하세요. ID는 6–64자의 영문 대소문자·숫자·밑줄·하이픈이며 대소문자를 구분합니다. 개인정보를 ID로 쓰지 마세요.

## 콘텐츠 확장

| 콘텐츠 | 초기 v1 | 확장 v2 |
|---|---:|---:|
| 중심 운세 | 48 | 240 |
| 등급별 중심 운세 | 8 | 40 |
| 항목별 풀이 | 144 | 1,440 |
| 항목·등급별 풀이 | 3 | 30 |
| 전체 데이터 항목 | 192 | **1,680** |

중심 운세는 고유 ID·고정 제비 번호·제목·시구·가르침을 포함합니다. 위 수치는 추첨 조합 수가 아니라 JSON에 저장된 레코드 수입니다. 완전히 동일한 시구·가르침·항목 풀이와 중복 ID·제비 번호가 없음을 테스트합니다. 문장 일부와 소재는 등급 사이에 공유됩니다.

가중치는 대길 10%, 길 20%, 중길 30%, 소길 25%, 말길 13%, 흉 2%입니다. 이는 창작 콘텐츠의 설계값이며 신사의 공식 확률이 아닙니다. 소원·기다리는 사람·연애·학업·일·금전·건강·여행을 다룹니다. 낮은 등급도 불행을 예언하기보다 확인과 여유를 권합니다.

### 편집 원본

- `content/topics-source.json`: 여덟 분야의 새 상황 216개, 각각 실천·주의 조언 한 쌍.
- `content/main-source.json`: 새 소재 32개, 각각 여섯 등급의 해석과 실천·주의 조언.
- `content/build-content.py`: 위 원고와 등급별 문체를 결합하여 정적 JSON을 생성. 문체 일부를 공유하는 편집 방식이며 1,680개 모두 서로 무관하게 쓴 원고라는 뜻은 아닙니다.
- 기존 192개 항목도 문구와 ID를 그대로 보존하여 확장판에 포함합니다.

원본을 편집한 후 다음을 실행하세요. Node.js와 Python이 필요하며 패키지 설치는 필요하지 않습니다.

```sh
python content/build-content.py
npm run build
npm test
```

`fortunes.json`을 직접 편집했다면 `npm run build`로 실행 파일에 반영할 수 있습니다. 다만 콘텐츠 생성기를 다시 실행하면 편집 원본 기준으로 덮어쓰므로 원본을 함께 관리하세요.

## 같은 날 같은 결과

`버전|한국 날짜|부적 ID`의 SHA-256으로 등급·중심 운세·여덟 풀이를 독립 선택합니다. 한국 시간 자정에 새 종이가 나오고 같은 날 재방문하면 펼침을 건너뜁니다. 방문 날짜와 움직임 설정만 브라우저에 저장하며 저장이 차단돼도 추첨은 동작합니다.

**초기 v1 파일을 `/v1/`에 그대로 보존했습니다.** v2는 새 버전이므로 같은 날짜와 ID라도 v1과 결과가 다를 수 있습니다. 출시 후에는 v2의 배열 순서·개수·문구·추첨 규칙도 고정하세요. 이후 확장은 새 버전으로 분리해야 기존 결과를 유지합니다.

서버 없는 구조라 기기 시계나 URL ID 변경을 차단하지 못합니다. ID는 인증 수단이 아닙니다.

## 로컬에서 열기

저장소 ZIP **전체를 압축 해제**하고 `index.html`을 Chrome·Edge·Safari 같은 실제 브라우저에서 열면 됩니다. file://에서는 `browser.js`의 동일한 내장 데이터를 사용합니다. HTML 하나만 옮기면 동작하지 않습니다.

HTTP로 확인하려면 `npm start` 실행 후 `http://127.0.0.1:4173` 접속. 종료는 Ctrl+C. `npm install`은 필요하지 않습니다.

## GitHub Pages

설정: **Settings → Pages → Source: GitHub Actions**.

`.github/workflows/pages.yml`은 main 푸시 시 테스트 → 실행 파일 재생성 일치 검사 → 공개용 파일 묶기 → Pages 배포를 수행합니다. `/v1/`도 함께 게시합니다. 편집 원고·개발 서버·테스트는 사이트 배포 묶음에서 제외합니다.

[GitHub 공식 게시 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 주요 파일

| 파일 | 역할 |
|---|---|
| index.html | 화면과 실행 실패 안내 |
| style.css / tokens.css / assets | 종이·도장 디자인과 모바일 레이아웃 |
| engine.js | 날짜·ID·SHA-256 추첨 |
| fortune.js | 화면 상태·방문 기록·자정 갱신 |
| fortunes.json | 전체 v2 데이터 |
| browser.js | 실제 실행 스크립트와 로컬용 데이터 |
| build-browser.js | 실행 스크립트 재생성 |
| content | 편집 원본과 콘텐츠 생성기 |
| tests | 데이터·추첨·버전 보존·번들 검증 |
| v1 | 동결한 초기 버전 |

특정 신사의 공식 운세가 아닌 창작 콘텐츠입니다. 실제 NFC 인식과 휴대전화별 표시는 실물 태그로 최종 확인하세요.
