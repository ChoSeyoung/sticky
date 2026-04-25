# Phase 20: HTML 소스 복사 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 20-html-copy
**Areas discussed:** 버튼 위치/스타일, 복사 피드백, 클립보드 fallback
**Mode:** --auto (all decisions auto-selected with recommended defaults)

---

## 버튼 위치 및 스타일

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 헤더 버튼 그룹에 추가 | bg-zinc-700 패턴으로 기존 버튼 옆에 배치 | ✓ |
| 에디터 상단 툴바에 별도 배치 | 에디터 영역 내부에 복사 버튼 추가 | |
| 플로팅 버튼 | 화면 우하단에 고정 플로팅 | |

**User's choice:** [auto] 기존 헤더 버튼 그룹에 추가 (recommended — 기존 패턴과 일관성)

---

## 복사 피드백

| Option | Description | Selected |
|--------|-------------|----------|
| 버튼 텍스트 일시 변경 | '소스 복사' → '복사됨!' 2초 후 원복 | ✓ |
| 토스트 알림 | 화면 하단에 토스트 메시지 | |
| 아이콘 변경 | 복사 아이콘 → 체크 아이콘 | |

**User's choice:** [auto] 버튼 텍스트 일시 변경 (recommended — 토스트 시스템 불필요, 최소 구현)

---

## 클립보드 fallback

| Option | Description | Selected |
|--------|-------------|----------|
| execCommand fallback | navigator.clipboard 우선, execCommand 대체 | ✓ |
| 텍스트 영역 표시 | 수동 복사를 위한 선택 가능 텍스트 영역 | |
| fallback 없음 | 미지원 시 에러 메시지만 | |

**User's choice:** [auto] execCommand fallback (recommended — 표준 fallback 패턴)

---

## Claude's Discretion

- 버튼 색상 변화 (복사 성공/실패)
- 정확한 버튼 배치 순서
- fallback textarea 구현 세부

## Deferred Ideas

None
