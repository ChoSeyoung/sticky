import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { to, subject, html, smtp } = await req.json()

  if (!to || !subject || !html) {
    return NextResponse.json({ error: '받는 사람, 제목, 본문은 필수입니다.' }, { status: 400 })
  }

  if (!smtp?.host || !smtp?.user || !smtp?.pass) {
    return NextResponse.json({ error: 'SMTP 설정(호스트, 계정, 비밀번호)을 입력하세요.' }, { status: 400 })
  }

  const port = Number(smtp.port || 587)

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port,
    secure: port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  })

  try {
    await transporter.sendMail({
      from: smtp.from || smtp.user,
      to,
      subject,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `발송 실패: ${message}` }, { status: 500 })
  }
}
