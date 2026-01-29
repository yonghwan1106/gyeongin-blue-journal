import HeadlineSlider from '@/components/article/HeadlineSlider'
import BreakingNews from '@/components/article/BreakingNews'
import ArticleList from '@/components/article/ArticleList'
import Sidebar from '@/components/layout/Sidebar'

export default function HomePage() {
  return (
    <>
      <BreakingNews />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Headline Slider */}
        <section className="mb-12">
          <HeadlineSlider />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* 최신 뉴스 */}
            <section>
              <ArticleList title="최신 뉴스" limit={6} />
            </section>

            {/* 정치 */}
            <section>
              <ArticleList
                title="정치"
                categorySlug="politics"
                limit={3}
                showMore
              />
            </section>

            {/* 경제 */}
            <section>
              <ArticleList
                title="경제"
                categorySlug="economy"
                limit={3}
                showMore
              />
            </section>

            {/* 사회 */}
            <section>
              <ArticleList
                title="사회"
                categorySlug="society"
                limit={3}
                showMore
              />
            </section>

            {/* 문화 */}
            <section>
              <ArticleList
                title="문화"
                categorySlug="culture"
                limit={3}
                showMore
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
