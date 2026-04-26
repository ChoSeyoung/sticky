# Phase 24: 스팸 트리거 분석 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 24-spam-trigger-analysis
**Areas discussed:** 스팸 키워드 탐지 규칙, 이미지/텍스트 비율 분석, 위험도 점수 체계, WarningPanel 통합
**Mode:** --auto (all decisions auto-selected)

---

## 스팸 키워드 탐지 규칙

| Option | Description | Selected |
|--------|-------------|----------|
| 한국어/영어 대표 키워드 + 패턴 | 대문자 남용, 감탄사, 한/영 스팸 키워드, 색상/크기 강조 | ✓ |
| 키워드만 (패턴 없음) | 단순 키워드 매칭만, 대문자/감탄사 패턴 미포함 | |
| 외부 스팸 DB 연동 | SpamAssassin 등 외부 데이터 활용 | |

**User's choice:** [auto] 한국어/영어 대표 키워드 + 패턴 (recommended default)
**Notes:** 키워드 목록은 별도 파일(spamKeywords.ts)로 분리하여 확장성 확보

---

## 이미지/텍스트 비율 분석

| Option | Description | Selected |
|--------|-------------|----------|
| 60%/80% 이미지 비율 기준 | 60% 이상 warning, 80% 이상 error (업계 표준) | ✓ |
| 50%/70% 보수적 기준 | 더 엄격한 기준 적용 | |
| 사용자 설정 가능 기준 | 임계값을 사용자가 조정 가능 | |

**User's choice:** [auto] 60%/80% 이미지 비율 기준 (recommended default)
**Notes:** 이미지 전용 메일은 별도 경고

---

## 위험도 점수 체계

| Option | Description | Selected |
|--------|-------------|----------|
| 저/중/고 3단계 | Low/Medium/High 단계 + 이슈 수 표시 | ✓ |
| 100점 만점 점수 | 수치 기반 세밀한 점수 | |
| 통과/미통과 2단계 | 단순 이진 판정 | |

**User's choice:** [auto] 저/중/고 3단계 (recommended default)
**Notes:** Phase 23 접근성 요약 패턴(통과/경고) 재사용

---

## WarningPanel 통합

| Option | Description | Selected |
|--------|-------------|----------|
| 📧 스팸 섹션 추가 | CSS/링크/접근성/스팸 4섹션 통합 | ✓ |
| 별도 스팸 패널 | WarningPanel과 분리된 독립 패널 | |
| 탭 기반 분리 | 기존 섹션과 탭으로 분리 | |

**User's choice:** [auto] 📧 스팸 섹션 추가 (recommended default)
**Notes:** Phase 22/23 확장 패턴과 동일

---

## Claude's Discretion

- 스팸 키워드 정확한 목록 및 매칭 알고리즘
- 이미지/텍스트 비율 계산 방식
- 위험도 점수 가중치 및 임계값
- 각 경고의 한국어 개선 안내 문구

## Deferred Ideas

None — discussion stayed within phase scope
