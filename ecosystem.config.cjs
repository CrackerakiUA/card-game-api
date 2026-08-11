module.exports = {
    apps: [
        {
            name: 'card-game-api',
            script: 'dist/main.js',
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            max_memory_restart: '300M',
            merge_logs: true,
            time: true,
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
