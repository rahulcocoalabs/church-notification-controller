module.exports = (app, methods, options) => {
    const notifications = methods.loadController('notifications', options);
    notifications.start();
    notifications.methods.get('/start-scanning', notifications.start, {
        auth: false
    });
    notifications.methods.get('/reload-config', notifications.reloadConfig, {
        auth: false
    });
 
}
