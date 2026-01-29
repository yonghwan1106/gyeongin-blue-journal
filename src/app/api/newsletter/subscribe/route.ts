import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://158.247.210.200:8090')

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await pb.collection('newsletter_subscribers').getList(1, 1, {
      filter: `email = "${email}"`,
    })

    if (existing.items.length > 0) {
      const subscriber = existing.items[0]
      if (subscriber.is_active) {
        return NextResponse.json(
          { error: '이미 구독 중인 이메일입니다.' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        await pb.collection('newsletter_subscribers').update(subscriber.id, {
          is_active: true,
        })
        return NextResponse.json({ message: '뉴스레터 구독이 재활성화되었습니다.' })
      }
    }

    // Create new subscription
    await pb.collection('newsletter_subscribers').create({
      email,
      is_active: true,
    })

    return NextResponse.json({ message: '뉴스레터 구독이 완료되었습니다.' })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
