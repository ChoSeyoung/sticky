import AdBanner from '@/app/components/AdBanner'

export const metadata = {
  title: '이메일 HTML 작성 가이드 — Sticky',
  description: '이메일 HTML 작성 기본 가이드. 클라이언트별 CSS 호환성, 인라인 CSS, 반응형 이메일 팁, 자주 하는 실수와 해결법.',
}

export default function GuidePage() {
  return (
    <div className="bg-zinc-900 min-h-screen text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* Navigation */}
        <nav className="flex gap-6 mb-12 text-sm">
          <a href="/" className="text-zinc-400 hover:text-zinc-200 transition-colors">← Sticky 홈으로</a>
          <a href="/editor" className="text-blue-400 hover:text-blue-300 transition-colors">에디터 열기 →</a>
        </nav>

        {/* Title Section */}
        <h1 className="text-4xl font-bold text-zinc-100 mb-4">이메일 HTML 작성 가이드</h1>
        <p className="text-xl text-zinc-400 leading-relaxed mb-12">
          이메일 클라이언트에서 깨지지 않는 HTML 이메일을 만드는 방법
        </p>

        {/* Ad Banner */}
        <AdBanner slot="4863048709" />

        {/* Section 1 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4 mt-12">이메일 HTML의 기본 원칙</h2>

          <p className="text-zinc-300 leading-relaxed mb-4">
            이메일 HTML은 웹 HTML과 근본적으로 다릅니다. 최신 웹 브라우저는 CSS Grid, Flexbox,
            시맨틱 태그를 지원하지만, 이메일 클라이언트는 각각 다른 렌더링 엔진을 사용합니다.
            Outlook Classic은 Microsoft Word의 렌더링 엔진을 사용하고, 네이버 메일은{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code>{' '}
            블록을 완전히 제거합니다.
          </p>

          <p className="text-zinc-300 leading-relaxed mb-4">
            따라서 이메일 HTML은 가장 낮은 공통분모에 맞춰 작성해야 합니다.
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<table>`}</code>{' '}
            기반 레이아웃을 사용하는 것이 여전히 가장 안전한 방법입니다.
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<div>`}</code>{' '}
            레이아웃은 일부 클라이언트에서 깨질 수 있습니다.
          </p>

          <p className="text-zinc-300 leading-relaxed mb-4">
            이메일의 최대 너비는 <strong className="text-zinc-100">600px</strong>로 제한하세요.
            대부분의 이메일 클라이언트의 읽기 영역이 이 너비에 최적화되어 있습니다.
            600px보다 넓은 이메일은 일부 클라이언트에서 가로 스크롤이 생기거나 잘릴 수 있습니다.
          </p>

          <p className="text-zinc-300 leading-relaxed mb-4">
            이메일 DOCTYPE은 항상 HTML 4.01 Transitional 또는 XHTML 1.0 Transitional을
            사용하는 것이 권장됩니다. HTML5 DOCTYPE도 사용 가능하지만 일부 구형 클라이언트에서
            호환성 문제가 발생할 수 있습니다.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4 mt-12">클라이언트별 CSS 호환성 팁</h2>

          <p className="text-zinc-300 leading-relaxed mb-6">
            각 이메일 클라이언트는 서로 다른 CSS 제한사항을 가지고 있습니다.
            주요 클라이언트별 특이사항과 해결 방법을 소개합니다.
          </p>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">네이버 메일</h3>
            <p className="text-zinc-300 leading-relaxed mb-2">
              <strong className="text-zinc-100">제한사항:</strong>{' '}
              <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code>{' '}
              블록을 완전히 제거합니다. margin, padding, font-family를 인라인으로 설정해도 차단합니다.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              <strong className="text-zinc-100">해결법:</strong>{' '}
              셀 패딩(<code className="bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">cellpadding</code>,{' '}
              <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">cellspacing</code>)으로 간격을 조절하고,
              웹폰트 대신 Arial, Georgia 같은 시스템 폰트를 사용하세요.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Gmail</h3>
            <p className="text-zinc-300 leading-relaxed mb-2">
              <strong className="text-zinc-100">제한사항:</strong>{' '}
              조건부{' '}
              <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code>{' '}
              블록 제거 — background-image url(), @import, @charset을 감지하면 해당 스타일 블록 전체를 제거합니다.
              HTML 파일 크기가 102KB를 초과하면 이메일을 자릅니다.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              <strong className="text-zinc-100">해결법:</strong>{' '}
              background-image는 반드시 인라인 스타일로 작성하고, @import 사용을 금지하세요.
              HTML 크기를 102KB 이하로 유지하세요.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">다음/카카오 메일</h3>
            <p className="text-zinc-300 leading-relaxed mb-2">
              <strong className="text-zinc-100">제한사항:</strong>{' '}
              script, iframe, object, embed 요소를 완전히 제거합니다. form 요소 사용 시 주의가 필요합니다.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              <strong className="text-zinc-100">해결법:</strong>{' '}
              인터랙티브 요소 대신 이미지와 링크 조합을 사용하세요.
              버튼처럼 보이는 요소는 이미지나 테이블 셀에 배경색을 입혀 구현하세요.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Outlook Classic</h3>
            <p className="text-zinc-300 leading-relaxed mb-2">
              <strong className="text-zinc-100">제한사항:</strong>{' '}
              Microsoft Word 렌더링 엔진을 사용합니다. background-image, border-radius, CSS animation,
              CSS float을 지원하지 않습니다.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              <strong className="text-zinc-100">해결법:</strong>{' '}
              VML(Vector Markup Language)을 사용한 배경 이미지, 이미지로 둥근 버튼 대체,
              조건부 주석으로 Outlook 전용 코드를 추가하세요.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Outlook New</h3>
            <p className="text-zinc-300 leading-relaxed mb-2">
              <strong className="text-zinc-100">특성:</strong>{' '}
              웹 기반으로 Gmail과 유사한 제한사항을 가집니다.
              max-width를 지원하며 비교적 현대적인 CSS를 처리할 수 있습니다.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              <strong className="text-zinc-100">팁:</strong>{' '}
              Outlook Classic에 비해 유연하지만, 여전히 복잡한 CSS 레이아웃은 피하는 것이 좋습니다.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4 mt-12">인라인 CSS를 사용하는 이유</h2>

          <p className="text-zinc-300 leading-relaxed mb-4">
            네이버 메일은{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code>{' '}
            블록을 무조건 제거합니다. Gmail도 특정 조건에서{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code>{' '}
            블록을 제거합니다. 따라서 중요한 스타일은 반드시 각 HTML 요소의{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">style</code>{' '}
            속성에 직접 작성해야 합니다. 이것이 <strong className="text-zinc-100">인라인 CSS</strong>입니다.
          </p>

          <p className="text-zinc-300 leading-relaxed mb-4">
            수동으로 인라인하면 유지보수가 매우 어렵습니다. CSS를 변경할 때마다 모든 요소의
            style 속성을 일일이 수정해야 하기 때문입니다. 따라서 먼저{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code>{' '}
            블록으로 스타일을 작성한 후, 발송 전에 자동으로 인라인 변환을 수행하는 것이 권장됩니다.
          </p>

          <p className="text-zinc-300 leading-relaxed mb-4">
            Sticky의 <strong className="text-zinc-100">Inline CSS</strong> 버튼을 사용하면{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">{`<style>`}</code>{' '}
            블록을 자동으로 인라인 스타일로 변환할 수 있습니다.
            변환 후 네이버 탭에서 스타일이 올바르게 적용되는지 확인하세요.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4 mt-12">반응형 이메일 작성 팁</h2>

          <p className="text-zinc-300 leading-relaxed mb-4">
            반응형 이메일은 @media 쿼리에 의존하지만, Gmail 앱은 미디어 쿼리를 지원하지 않습니다.
            따라서 <strong className="text-zinc-100">하이브리드 코딩</strong> 기법을 사용합니다:
            기본 레이아웃을 모바일 크기(100%)로 설정하고, 미디어 쿼리로 데스크톱 레이아웃을 추가합니다.
          </p>

          <p className="text-zinc-300 leading-relaxed mb-4">
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">max-width</code>와{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">width</code>를{' '}
            함께 사용하면 미디어 쿼리 없이도 유연한 레이아웃을 만들 수 있습니다.
            예: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">width: 100%; max-width: 600px;</code>
          </p>

          <p className="text-zinc-300 leading-relaxed mb-4">
            이미지에는 반드시{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">max-width: 100%</code>를{' '}
            인라인 스타일로 설정하세요. 그래야 작은 화면에서 이미지가 컨테이너를 벗어나지 않습니다.
            또한 Retina 디스플레이를 위해 실제 크기의 2배 이미지를 사용하고{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">width</code>,{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">height</code>{' '}
            속성으로 표시 크기를 지정하세요.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4 mt-12">자주 하는 실수와 해결법</h2>

          <p className="text-zinc-300 leading-relaxed mb-6">
            이메일 HTML을 처음 작성할 때 흔히 하는 실수들과 그 해결 방법입니다.
          </p>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <p className="font-semibold text-zinc-100 mb-2">실수 1: div 기반 레이아웃 사용</p>
            <p className="text-zinc-400 leading-relaxed">
              <strong>해결법:</strong> table 레이아웃을 사용하세요. Outlook Classic을 포함한 모든 클라이언트에서
              안전하게 작동합니다. Flexbox, Grid, float 기반 레이아웃은 피하세요.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <p className="font-semibold text-zinc-100 mb-2">실수 2: 외부 CSS 파일 링크</p>
            <p className="text-zinc-400 leading-relaxed">
              <strong>해결법:</strong> 외부 스타일시트 링크는 대부분의 이메일 클라이언트에서 차단됩니다.
              모든 스타일을 인라인으로 작성하거나, 발송 전에 인라인 CSS 변환 도구를 사용하세요.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <p className="font-semibold text-zinc-100 mb-2">실수 3: JavaScript 사용</p>
            <p className="text-zinc-400 leading-relaxed">
              <strong>해결법:</strong> 이메일에서 JavaScript는 보안상 이유로 완전히 차단됩니다.
              정적 HTML과 이미지, 링크만을 사용하세요. 인터랙티브 요소가 필요하다면 랜딩 페이지로 연결하세요.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <p className="font-semibold text-zinc-100 mb-2">실수 4: 이미지에 alt 텍스트 누락</p>
            <p className="text-zinc-400 leading-relaxed">
              <strong>해결법:</strong> 모든 이미지에 descriptive alt 텍스트를 반드시 추가하세요.
              많은 이메일 클라이언트는 기본적으로 이미지를 차단하므로, alt 텍스트가 없으면
              빈 공간만 표시됩니다. 이미지가 장식용이라면 alt=""을 사용하세요.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <p className="font-semibold text-zinc-100 mb-2">실수 5: 큰 이미지 파일</p>
            <p className="text-zinc-400 leading-relaxed">
              <strong>해결법:</strong> 이미지는 최적화하여 600px 이하 너비, 100KB 이하 파일 크기로
              유지하세요. 큰 이미지는 로딩 시간을 늘리고 스팸 필터에 걸릴 가능성을 높입니다.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 mb-4">
            <p className="font-semibold text-zinc-100 mb-2">실수 6: Gmail 102KB 제한 무시</p>
            <p className="text-zinc-400 leading-relaxed">
              <strong>해결법:</strong> Gmail은 HTML 파일 크기가 102KB를 초과하면 이메일을 잘라냅니다.
              불필요한 주석, 공백, 인라인 스타일 중복을 제거하여 HTML 크기를 102KB 이하로 유지하세요.
              Sticky 에디터의 우측 상단에서 현재 HTML 크기를 실시간으로 확인할 수 있습니다.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center py-12 bg-zinc-800 rounded-2xl">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">Sticky 에디터에서 직접 테스트해보세요</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            위 가이드를 읽었다면 이제 직접 이메일 HTML을 작성하고 테스트해보세요.
            네이버, Gmail, Outlook 등 5개 클라이언트에서 어떻게 보이는지 실시간으로 확인할 수 있습니다.
          </p>
          <a
            href="/editor"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            에디터 열기 →
          </a>
        </section>

        {/* Bottom Ad Banner */}
        <div className="mt-12">
          <AdBanner slot="4863048709" />
        </div>

      </div>
    </div>
  )
}
