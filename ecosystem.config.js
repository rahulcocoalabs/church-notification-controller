module.exports = {
    apps : [
    {
      name: 'notifications - Church Notification manager Microservices',
      script: 'notifications.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 3050
      }
    }
   
    ]
  };