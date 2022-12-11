module.exports = {
  apps: [
    {
      script: 'dist/main.js',
      name: 'nodejs-rate-limiting',
      instances: 'max',
    },
  ],
};
