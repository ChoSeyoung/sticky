'use client'

import dynamic from 'next/dynamic'

const AdBanner = dynamic(() => import('@/app/components/AdBanner'), { ssr: false })

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-6 leading-tight">
            Sticky — 한국 이메일 클라이언트 미리보기 도구
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            HTML 이메일을 붙여넣으면 네이버, Gmail, 다음/카카오, Outlook에서 어떻게 보이는지
            실시간으로 확인하세요. 한국 이메일 클라이언트의 고유 CSS 제한사항을 정확히 시뮬레이션합니다.
          </p>
          <a
            href="/editor"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            에디터 시작하기 →
          </a>
          <p className="mt-4 text-sm text-zinc-500">
            무료 · 회원가입 불필요 · 브라우저에서 바로 사용
          </p>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="max-w-5xl mx-auto px-4">
        <AdBanner slot="4863048709" />
      </div>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-100 mb-10 text-center">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">한국 이메일 클라이언트 지원</h3>
              <p className="text-zinc-400 leading-relaxed">
                네이버 메일, 다음/카카오 메일의 고유 CSS 제한사항을 정확히 시뮬레이션합니다.
                caniemail.com에 없는 독자 조사 규칙셋을 사용하여 실제 렌더링 결과에 가장 가깝게 재현합니다.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">글로벌 클라이언트 지원</h3>
              <p className="text-zinc-400 leading-relaxed">
                Gmail, Outlook Classic, Outlook New의 렌더링 차이를 한눈에 비교하세요.
                각 클라이언트의 CSS 지원 범위가 다르므로 한 화면에서 동시에 비교하는 것이 중요합니다.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">CSS 호환성 검사</h3>
              <p className="text-zinc-400 leading-relaxed">
                각 클라이언트에서 차단되는 CSS 속성을 자동으로 감지하고 경고를 표시합니다.
                문제가 되는 스타일을 미리 파악하여 이메일을 보내기 전에 수정할 수 있습니다.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">자동 CSS 인라이닝</h3>
              <p className="text-zinc-400 leading-relaxed">
                {`<style>`} 블록을 인라인 스타일로 자동 변환합니다. 네이버 메일처럼 스타일 블록을
                완전히 제거하는 클라이언트에서도 스타일이 올바르게 표시됩니다.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">링크 및 접근성 검증</h3>
              <p className="text-zinc-400 leading-relaxed">
                깨진 링크, alt 텍스트 누락, 접근성 문제를 자동으로 검사합니다.
                이메일 발송 전에 품질 문제를 발견하고 수정하여 더 나은 사용자 경험을 제공하세요.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">스팸 필터 분석</h3>
              <p className="text-zinc-400 leading-relaxed">
                스팸 키워드, 이미지/텍스트 비율 등 스팸 점수에 영향을 주는 요소를 분석합니다.
                Gmail 102KB 제한 초과 여부도 실시간으로 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 px-4 bg-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-100 mb-12 text-center">3단계로 시작하기</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 text-center">
              <div className="text-6xl font-bold text-blue-500 mb-4">1</div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">HTML 붙여넣기</h3>
              <p className="text-zinc-400 leading-relaxed">
                에디터에 이메일 HTML 코드를 붙여넣거나 파일을 드래그앤드롭하세요.
                기본 예시 템플릿이 미리 로드되어 있어 바로 테스트해볼 수 있습니다.
              </p>
            </div>
            <div className="flex-1 text-center">
              <div className="text-6xl font-bold text-blue-500 mb-4">2</div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">클라이언트별 확인</h3>
              <p className="text-zinc-400 leading-relaxed">
                네이버, Gmail, Outlook 등 원하는 클라이언트를 선택하고 렌더링 결과를 비교하세요.
                에디터를 수정하면 프리뷰가 실시간으로 갱신됩니다.
              </p>
            </div>
            <div className="flex-1 text-center">
              <div className="text-6xl font-bold text-blue-500 mb-4">3</div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">문제 수정</h3>
              <p className="text-zinc-400 leading-relaxed">
                경고 패널에서 호환성 문제를 확인하고 CSS 인라이닝으로 수정하세요.
                모든 클라이언트에서 올바르게 표시되는 이메일을 만들 수 있습니다.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <a
              href="/editor"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              에디터 시작하기 →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-100 mb-10 text-center">자주 묻는 질문</h2>
          <div className="space-y-4">
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-zinc-100 mb-2">Sticky는 무료인가요?</h3>
              <p className="text-zinc-400 leading-relaxed">
                네, 완전 무료입니다. 회원가입 없이 브라우저에서 바로 사용할 수 있으며,
                모든 처리는 클라이언트 측에서 이루어져 데이터가 서버로 전송되지 않습니다.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-zinc-100 mb-2">한국 이메일 클라이언트가 특별한 이유는?</h3>
              <p className="text-zinc-400 leading-relaxed">
                네이버 메일은 <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code> 블록을
                완전히 제거하고 margin, padding, font-family 등을 차단합니다.
                다음/카카오 메일은 script, iframe 등을 제거합니다.
                이런 제한사항은 caniemail.com에 데이터가 없어 직접 조사한 규칙셋을 사용합니다.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-zinc-100 mb-2">CSS 인라이닝이 뭔가요?</h3>
              <p className="text-zinc-400 leading-relaxed">
                <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code> 블록의 CSS를
                각 HTML 요소의 style 속성으로 변환하는 과정입니다.
                네이버 메일처럼 <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code> 블록을
                제거하는 클라이언트에서 스타일을 유지하려면 필수입니다.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-zinc-100 mb-2">어떤 이메일 클라이언트를 지원하나요?</h3>
              <p className="text-zinc-400 leading-relaxed">
                네이버 메일, Gmail, 다음/카카오 메일, Outlook Classic, Outlook New 총 5개 클라이언트의
                렌더링을 지원합니다. 각 클라이언트의 실제 CSS 제한사항을 반영한 시뮬레이션을 제공합니다.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-zinc-100 mb-2">내 이메일 데이터는 안전한가요?</h3>
              <p className="text-zinc-400 leading-relaxed">
                모든 처리는 브라우저에서 이루어집니다. HTML 코드가 서버로 전송되지 않으므로
                개인정보 걱정 없이 사용할 수 있습니다. 민감한 내용이 포함된 이메일도 안전하게 테스트하세요.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-zinc-100 mb-2">이메일 HTML 작성 가이드가 있나요?</h3>
              <p className="text-zinc-400 leading-relaxed">
                네, 이메일 HTML 작성 기본 가이드를 제공합니다.{' '}
                <a href="/guide" className="text-blue-400 hover:text-blue-300 underline">
                  이메일 HTML 가이드 페이지
                </a>
                에서 클라이언트별 CSS 호환성, 인라인 CSS, 반응형 이메일 팁, 자주 하는 실수와 해결법을 확인하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Second Ad Banner */}
      <div className="max-w-5xl mx-auto px-4">
        <AdBanner slot="4863048709" />
      </div>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-700 py-8 px-4 mt-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-zinc-300 font-semibold">Sticky — 한국 이메일 클라이언트 미리보기 도구</p>
            </div>
            <nav className="flex gap-6">
              <a href="/editor" className="text-zinc-400 hover:text-zinc-200 transition-colors">에디터</a>
              <a href="/guide" className="text-zinc-400 hover:text-zinc-200 transition-colors">이메일 가이드</a>
            </nav>
          </div>
          <p className="text-zinc-600 text-sm mt-4 text-center md:text-left">
            © 2026 Sticky. 모든 처리는 브라우저에서 이루어집니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
