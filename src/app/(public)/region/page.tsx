'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, ChevronRight } from 'lucide-react'
import { getPb } from '@/lib/pocketbase'

interface Region {
  id: string
  name: string
  slug: string
  type: 'province' | 'metro' | 'city' | 'county'
  order: number
}

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRegions()
  }, [])

  const fetchRegions = async () => {
    try {
      const records = await getPb().collection('regions').getFullList<Region>({
        sort: 'order',
      })
      setRegions(records)
    } catch (error) {
      console.error('Failed to fetch regions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRegionTypeLabel = (type: string) => {
    switch (type) {
      case 'province': return '도'
      case 'metro': return '광역시'
      case 'city': return '시'
      case 'county': return '군'
      default: return ''
    }
  }

  const getRegionTypeColor = (type: string) => {
    switch (type) {
      case 'province': return 'bg-blue-100 text-blue-700'
      case 'metro': return 'bg-purple-100 text-purple-700'
      case 'city': return 'bg-green-100 text-green-700'
      case 'county': return 'bg-orange-100 text-orange-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  // 그룹핑
  const provinceRegions = regions.filter(r => r.type === 'province')
  const metroRegions = regions.filter(r => r.type === 'metro')
  const cityRegions = regions.filter(r => r.type === 'city')
  const countyRegions = regions.filter(r => r.type === 'county')

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">지역별 뉴스</h1>
        </div>
        <p className="text-secondary">경기도 31개 시군과 인천시의 지역 뉴스를 확인하세요</p>
      </div>

      {/* 경기도 */}
      {provinceRegions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className={`px-2 py-0.5 text-sm rounded ${getRegionTypeColor('province')}`}>
              {getRegionTypeLabel('province')}
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {provinceRegions.map((region) => (
              <Link
                key={region.id}
                href={`/region/${region.slug}`}
                className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
              >
                <span className="font-medium text-foreground group-hover:text-primary">
                  {region.name}
                </span>
                <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 인천광역시 */}
      {metroRegions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className={`px-2 py-0.5 text-sm rounded ${getRegionTypeColor('metro')}`}>
              {getRegionTypeLabel('metro')}
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {metroRegions.map((region) => (
              <Link
                key={region.id}
                href={`/region/${region.slug}`}
                className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
              >
                <span className="font-medium text-foreground group-hover:text-primary">
                  {region.name}
                </span>
                <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 시 */}
      {cityRegions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className={`px-2 py-0.5 text-sm rounded ${getRegionTypeColor('city')}`}>
              {getRegionTypeLabel('city')}
            </span>
            <span className="text-sm text-secondary font-normal">({cityRegions.length}개)</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cityRegions.map((region) => (
              <Link
                key={region.id}
                href={`/region/${region.slug}`}
                className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
              >
                <span className="font-medium text-foreground group-hover:text-primary">
                  {region.name}
                </span>
                <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 군 */}
      {countyRegions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className={`px-2 py-0.5 text-sm rounded ${getRegionTypeColor('county')}`}>
              {getRegionTypeLabel('county')}
            </span>
            <span className="text-sm text-secondary font-normal">({countyRegions.length}개)</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {countyRegions.map((region) => (
              <Link
                key={region.id}
                href={`/region/${region.slug}`}
                className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
              >
                <span className="font-medium text-foreground group-hover:text-primary">
                  {region.name}
                </span>
                <ChevronRight className="w-4 h-4 text-secondary group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
