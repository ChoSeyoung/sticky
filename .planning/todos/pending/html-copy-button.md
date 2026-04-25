---
title: HTML 소스 복사 버튼 추가
date: 2026-04-25
priority: high
---

## HTML 소스 복사 버튼

헤더 영역에 "소스 복사" 버튼을 추가하여 현재 에디터의 HTML을 클립보드에 복사할 수 있게 한다.

- Clipboard API (`navigator.clipboard.writeText`) 사용
- 복사 완료 시 버튼 텍스트를 "복사됨"으로 잠시 변경하여 피드백 제공
- 검수 완료 후 소스코드를 프로젝트에 가져가는 마지막 단계
