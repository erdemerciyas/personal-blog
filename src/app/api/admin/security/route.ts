import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import SecurityAudit, { SecurityEvents } from '../../../../lib/security-audit';

export const dynamic = 'force-dynamic';

// GET /api/admin/security - Güvenlik dashboard verilerini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Admin kontrolü
    if (!session?.user?.email || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Get client IP for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log admin access
    SecurityEvents.adminAccess(clientIP, session.user.email, '/api/admin/security', userAgent);

    // Get security summary for different timeframes
    const last24Hours = SecurityAudit.getSecuritySummary(24 * 60 * 60 * 1000);
    const last7Days = SecurityAudit.getSecuritySummary(7 * 24 * 60 * 60 * 1000);
    const last30Days = SecurityAudit.getSecuritySummary(30 * 24 * 60 * 60 * 1000);

    // Get recent suspicious activities
    const recentSuspicious = SecurityAudit.getEventsByType('suspicious_activity', 20);
    const recentFailedLogins = SecurityAudit.getEventsByType('login_failure', 20);
    
    // Get blocked IPs
    const blockedIPs = SecurityAudit.getBlockedIPs();

    // Security metrics
    const securityMetrics = {
      overview: {
        last24Hours,
        last7Days,
        last30Days
      },
      recentEvents: {
        suspiciousActivities: recentSuspicious.map(event => ({
          timestamp: event.timestamp,
          ip: event.ip,
          details: event.details,
          severity: event.severity
        })),
        failedLogins: recentFailedLogins.map(event => ({
          timestamp: event.timestamp,
          ip: event.ip,
          email: event.email,
          userAgent: event.userAgent,
          details: event.details
        }))
      },
      security: {
        blockedIPs: blockedIPs.length,
        blockedIPsList: blockedIPs,
        totalEvents: SecurityAudit.getRecentEvents(24 * 60 * 60 * 1000).length,
        criticalEvents: SecurityAudit.getRecentEvents(24 * 60 * 60 * 1000)
          .filter(e => e.severity === 'critical').length,
        highSeverityEvents: SecurityAudit.getRecentEvents(24 * 60 * 60 * 1000)
          .filter(e => e.severity === 'high').length
      },
      recommendations: generateSecurityRecommendations(last24Hours, recentSuspicious, blockedIPs)
    };

    return NextResponse.json(securityMetrics);

  } catch (error) {
    console.error('Security dashboard error:', error);
    return NextResponse.json(
      { error: 'Güvenlik verileri alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/admin/security - Güvenlik aksiyonları (IP engelleme, log temizleme vb.)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Admin kontrolü
    if (!session?.user?.email || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { action, data } = await request.json();
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log admin action
    SecurityEvents.adminAccess(clientIP, session.user.email, `/api/admin/security/${action}`, userAgent);

    switch (action) {
      case 'clear_old_events':
        SecurityAudit.clearOldEvents(data?.olderThanMs || 7 * 24 * 60 * 60 * 1000);
        return NextResponse.json({ message: 'Eski güvenlik olayları temizlendi' });

      case 'export_events':
        const format = data?.format || 'json';
        const exportData = SecurityAudit.exportEvents(format);
        return NextResponse.json({ 
          message: 'Güvenlik olayları dışa aktarıldı',
          data: exportData,
          format
        });

      case 'block_ip':
        if (!data?.ip) {
          return NextResponse.json({ error: 'IP adresi gerekli' }, { status: 400 });
        }
        
        // Log manual IP block
        SecurityEvents.suspiciousActivity(data.ip, 'manual_ip_block', {
          blockedBy: session.user.email,
          reason: data.reason || 'Manual block by admin'
        });
        
        return NextResponse.json({ 
          message: `IP ${data.ip} engellendi`,
          blockedIP: data.ip
        });

      default:
        return NextResponse.json({ error: 'Geçersiz aksiyon' }, { status: 400 });
    }

  } catch (error) {
    console.error('Security action error:', error);
    return NextResponse.json(
      { error: 'Güvenlik aksiyonu gerçekleştirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Generate security recommendations based on current data
function generateSecurityRecommendations(
  summary: Record<string, unknown>, 
  suspiciousEvents: unknown[], 
  blockedIPs: string[]
): string[] {
  const recommendations: string[] = [];

  // High failed login rate
  if (Number((summary as { failedLogins?: number }).failedLogins ?? 0) > 20) {
    recommendations.push('Yüksek başarısız giriş denemesi tespit edildi. Rate limiting ayarlarını gözden geçirin.');
  }

  // Many suspicious activities
  if (Number((summary as { suspiciousActivity?: number }).suspiciousActivity ?? 0) > 10) {
    recommendations.push('Çok sayıda şüpheli aktivite tespit edildi. Güvenlik kurallarını sıkılaştırın.');
  }

  // Too many blocked IPs
  if (blockedIPs.length > 50) {
    recommendations.push('Çok sayıda IP engellendi. DDoS saldırısı olasılığını değerlendirin.');
  }

  // Recent critical events
  const recentCritical = suspiciousEvents.filter(e => (e as { severity?: string }).severity === 'critical');
  if (recentCritical.length > 0) {
    recommendations.push('Kritik güvenlik olayları tespit edildi. Acil müdahale gerekebilir.');
  }

  // Low activity might indicate issues
  if (Number((summary as { totalEvents?: number }).totalEvents ?? 0) < 10) {
    recommendations.push('Düşük aktivite tespit edildi. Güvenlik loglarının düzgün çalıştığını kontrol edin.');
  }

  // Default recommendation if no issues
  if (recommendations.length === 0) {
    recommendations.push('Güvenlik durumu normal görünüyor. Düzenli kontrollere devam edin.');
  }

  return recommendations;
}