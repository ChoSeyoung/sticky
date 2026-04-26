# Phase 22: 링크 검증 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-04-25
**Phase:** 22-link-validation
**Areas discussed:** 검증 규칙, WarningPanel 통합, 경고 표시 형식
**Mode:** --auto

---

## 검증 규칙

| Option | Description | Selected |
|--------|-------------|----------|
| SC 명시 4가지 규칙 | 빈 href, #, example.com, 프로토콜 누락 | ✓ |
| 확장 규칙 (mailto, tel 검증 포함) | 추가 프로토콜 검증 | |

**User's choice:** [auto] SC 명시 4가지 규칙

---

## WarningPanel 통합

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 WarningPanel 확장 | CSS + 링크 경고 통합 | ✓ |
| 별도 패널 추가 | LinkWarningPanel 신규 생성 | |

**User's choice:** [auto] 기존 WarningPanel 확장

---

## 경고 표시 형식

| Option | Description | Selected |
|--------|-------------|----------|
| CSS 경고 동일 패턴 | 링크 텍스트 + 문제 유형 + 줄 번호 | ✓ |
| 간략 표시 | 문제 유형만 | |

**User's choice:** [auto] CSS 경고 동일 패턴

## Deferred Ideas

None
