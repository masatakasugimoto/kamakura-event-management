module.exports = {
  apps: [
    {
      name: 'kamakura-backend',
      script: './node_modules/.bin/ts-node-dev',
      args: '--respawn --transpile-only src/index.ts',
      cwd: '/usr/local/project/map/kamakura-event-management/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      ignore_watch: ['node_modules', 'data']
    },
    {
      name: 'kamakura-frontend',
      script: 'serve-https.cjs',
      cwd: '/usr/local/project/map/kamakura-event-management/frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};