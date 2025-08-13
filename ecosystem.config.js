module.exports = {
  apps: [
    {
      name: 'kamakura-backend',
      script: './node_modules/.bin/ts-node-dev',
      args: '--respawn --transpile-only src/index.ts',
      cwd: '/home/ubuntu/project/prod1/kamakura-event-management/backend',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: true,
      ignore_watch: ['node_modules', 'data']
    },
    {
      name: 'kamakura-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/ubuntu/project/prod1/kamakura-event-management/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 4174
      }
    }
  ]
};