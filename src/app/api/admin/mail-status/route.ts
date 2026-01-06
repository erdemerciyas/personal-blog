import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/core/lib/config';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const mailConfig = config.mail;

    // Mail konfigürasyon durumu
    const status = {
      configured: mailConfig.isConfigured,
      gmailUser: mailConfig.gmailUser ? `${mailConfig.gmailUser.substring(0, 3)}***@${mailConfig.gmailUser.split('@')[1]}` : null,
      hasAppPassword: !!mailConfig.gmailAppPassword,
      smtpTest: false,
      error: null as string | null
    };

    // SMTP bağlantı testi (sadece konfigüre edilmişse)
    if (mailConfig.isConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: mailConfig.gmailUser,
            pass: mailConfig.gmailAppPassword,
          },
        });

        await transporter.verify();
        status.smtpTest = true;
      } catch (error) {
        status.error = error instanceof Error ? error.message : 'SMTP connection failed';
      }
    }

    return NextResponse.json({
      success: true,
      data: status,
      message: status.configured
        ? (status.smtpTest ? 'Mail sistemi aktif ve çalışıyor' : 'Mail konfigürasyonu var ama SMTP bağlantısı başarısız')
        : 'Mail sistemi konfigüre edilmemiş'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Mail status check failed'
    }, { status: 500 });
  }
}
