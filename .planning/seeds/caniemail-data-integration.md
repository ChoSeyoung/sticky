---
title: CSS 호환성 caniemail 데이터 연동
trigger_condition: 현재 수동 관리 룰셋의 한계가 드러나거나, 지원 클라이언트 수 확장 시
planted_date: 2026-04-25
---

## caniemail.com 데이터 연동

현재 수동으로 관리하는 클라이언트별 CSS 룰셋을 caniemail.com의 오픈소스 JSON 데이터로 대체/보완.

- caniemail.com은 CSS 속성별 이메일 클라이언트 지원 여부를 구조화된 데이터로 제공
- 빌드 시 데이터를 가져와 정적 호환성 DB로 변환
- 더 정밀한 CSS 경고, 더 많은 클라이언트 커버리지 확보
- 기존 룰셋 대비 유지보수 부담 감소
