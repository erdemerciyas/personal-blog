import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import { logger } from '@/core/lib/logger';

const execAsync = util.promisify(exec);

export async function POST() {
    try {
        // This command runs git pull to get latest changes
        logger.info('Starting system update...', 'SYSTEM');

        // Execute git pull
        const { stdout, stderr } = await execAsync('git pull origin main'); // Assuming main branch

        logger.info('Git pull output', 'SYSTEM', { stdout, stderr });

        if (stderr && !stdout) {
            throw new Error(stderr);
        }

        return NextResponse.json({
            success: true,
            newVersion: 'Pending Restart',
            message: 'Kaynak kodları başarıyla güncellendi (Git Pull). Değişikliklerin aktif olması için lütfen terminalden uygulamayı yeniden başlatın: `npm run build && npm run start`'
        });

    } catch (error: any) {
        logger.error('Update execution failed', 'SYSTEM', { error });
        return NextResponse.json({
            success: false,
            error: error.message || 'Git pull failed'
        }, { status: 500 });
    }
}
