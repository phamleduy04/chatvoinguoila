module.exports = {
  apps: [
    {
      name: 'chatbattu',
      script: './index.js',
      watch: '.',
      instances: 'max',
    },
    {
      script: './service-worker/',
      watch: ['./service-worker'],
    },
  ],
};
