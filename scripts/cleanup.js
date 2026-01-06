const { exec } = require('child_process');

const PORT = 3000;

function killPort(port) {
    const command = process.platform === 'win32'
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port} -t`;

    exec(command, (err, stdout) => {
        if (err || !stdout) {
            console.log(`Port ${port} is free.`);
            return;
        }

        const pids = process.platform === 'win32'
            ? stdout.trim().split('\n').map(line => line.trim().split(/\s+/).pop()).filter(Boolean)
            : stdout.trim().split('\n');

        // Unique PIDs only
        const uniquePids = [...new Set(pids)];

        if (uniquePids.length === 0) {
            console.log(`Port ${port} is free.`);
            return;
        }

        console.log(`Killing processes on port ${port}: ${uniquePids.join(', ')}`);

        uniquePids.forEach(pid => {
            // Avoid killing self if by chance we have same PID (unlikely but safe)
            if (pid == process.pid) return;

            const killCommand = process.platform === 'win32'
                ? `taskkill /F /PID ${pid}`
                : `kill -9 ${pid}`;

            exec(killCommand, (killErr) => {
                if (killErr) {
                    console.error(`Failed to kill PID ${pid}: ${killErr.message}`);
                } else {
                    console.log(`Killed PID ${pid}`);
                }
            });
        });
    });
}

killPort(PORT);
