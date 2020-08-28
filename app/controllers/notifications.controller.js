

const OneSignal = require('onesignal-node');
const ONE_SIGNAL_APP_ID = "b75e1d5c-cf49-42cd-b257-3d3f177f1342";
const ONE_SGINAL_API_KEY = "";
const client = new OneSignal.Client('65011cfa-62d9-4e0c-b249-cb3f679da7d9', 'ZGUxYThkNzctM2MxMC00MWM0LTk3Y2YtYjk5MDY1NGQxMThk');
const config = require('../../config/app.config');
const oneSignalConfig = config.oneSignal;
var MongodbPushMessage = require('../models/pushNotification.model');

function notificationsController(methods, options) {

    const constants = require('../helpers/constants');

    // const Notification = methods.loadModel('notification');

    this.isProcessingOnGoing = false;
    this.scanningIntervalSeconds = 5;

    this.timer = null;
    this.oneSignalConfig = null;
    this.oneSignalClient = null;
    this.loadConfig = async () => {
        console.log("2")

       
        await this.loadSettings();
        console.log("this.oneSignalConfig")
        console.log(this.oneSignalConfig)
        console.log("this.oneSignalConfig")
        if (this.oneSignalConfig) {
            this.oneSignalClient = new OneSignal.Client(this.oneSignalConfig.oneSignalAppId, this.oneSignalConfig.oneSignalApiKey);
        }


        /**?
         * 1. Identify the db 
         * 2. Update isMysqldb and ismongodb
         * 3. call find scanning interval
         * 4.  Init scanning interval
         * 
         * 
         */
    }
    this.reloadConfig = async () => {
        console.log("inside reloadConfig")

        this.isProcessingOnGoing = false;
        this.scanningIntervalSeconds = 5;
  
        this.timer = null;
        this.oneSignalConfig = null;
        this.oneSignalClient = null;
        /**?
         * 1. Stop the timer
         * 2. set timer as null
         * 3. all confiq values to initial values
         * 4. call start
         * 
         * 
         */
    }
    
    this.loadSettingsForMongoDb = async () => {
        // let scanningIntervalData = await MongodbNotificationManagerConfig.findOne({
        //     status: 1
        // }, {
        //     scanningIntervalPushMessages: 1,
        //     onesignalApiKey: 1,
        //     onesignalAppId: 1
        // })
        //     .catch(err => {
        //         return {
        //             success: 0,
        //             message: 'Something went wrong while getting notification config',
        //             error: err
        //         }
        //     })

        // if (scanningIntervalData && scanningIntervalData.error && scanningIntervalData !== null) {
        //    this.oneSignalConfig = null;
        // }else{
        //     scanningIntervalData = JSON.parse(JSON.stringify(scanningIntervalData));
        this.scanningIntervalSeconds = oneSignalConfig.scanningInterval;
        this.oneSignalConfig = {
            oneSignalAppId: oneSignalConfig.appId,
            oneSignalApiKey: oneSignalConfig.apiKey,
        // }
    }
    }
    this.loadSettings = async () => {
        await this.loadSettingsForMongoDb();
        return this.scanningIntervalSeconds;

    }
    this.nextIteration = () => {
        var that = this;
        this.timer = setTimeout(async () => {
            await that.doProcessing();
        }, 2 * 1000);

    }
    this.doProcessing = async () => {
            console.log("Next iteration...");
        if (!this.isProcessingOnGoing) {
            console.log("Processing is not ongoing");
            this.isProcessingOnGoing = true;
            await this.handleNewPushMessages();
        } else {
            console.log("Processing is ongoing..Skipping...");
        }
        return this.nextIteration();
    }
    this.start = async () => {
        console.log("Starting notifications service...");
        if (this.timer === null) {
            console.log("Calling config...");
            await this.loadConfig();
            await this.nextIteration();
            this.isProcessingOnGoing = false;

        }
    }
    this.handleNewPushMessages = async (req, res) => {
        var notificationList = [];
     
        if (!this.oneSignalConfig) {
             await this.reloadConfig();
        }
     
            notificationList = await this.getPushMessageFromMongoDb();
   
        await this.processPushNessages(notificationList) 
        this.isProcessingOnGoing  = false;
    }

    this.processPushNessages = async (notificationsList) => {
       
        console.log("Processing push messages");
        notificationsList = JSON.parse(JSON.stringify(notificationsList));
            await Promise.all(notificationsList.map(async (notification) => {
                let response = await this.sendPushNotification(notification);
                if(response.success === 1){
                let updateData = await this.markAsSentToMongoDb(notification);
                }
            }));
    }

 

    this.getPushMessageFromMongoDb = async () => {
        console.log("inside getPushMessageFromMongoDb")
       
        let notificationList = await MongodbPushMessage.find({
            isSent: 0,
            status: 1
        })
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while listing push notification ',
                    error: err
                }
            })
      
        if (notificationList && notificationList.error && (notificationList.error !== null)) {
            return [];
        }

       
        return notificationList;
        //return all messages with status 1 and not sent, from mongo db

    }

    this.sendPushNotification = async (notification) => {
        var notificationData = {
            // contents: message,
            contents : {
                    "tr": notification.messageText,
                    "en": notification.messageText,
                 },
                 headings : {
                    "en" : notification.title
                 },
            subtitle : {
                "en" : notification.messageText,
            },
            data:{
                // "name" : "Abcd",
                "type" : notification.type,
                "reference_id" : notification.referenceId,
            }
            ,
            included_segments: null,
            filters: notification.filtersJsonArr
        };
     

        // using async/await
        try {
           
            const response = await this.oneSignalClient.createNotification(notificationData);
            console.log("response");
            console.log(response);
            console.log("response");
            console.log(response.body.id);
            return { 
                success : 1
            }
        } catch (e) {
            console.log("e")
            console.log(e)
            console.log("e")
            if (e instanceof OneSignal.HTTPError) {
                // When status code of HTTP response is not 2xx, HTTPError is thrown.
                console.log(e.statusCode);
                console.log(e.body);
            }
            return { 
                success : 0
            }
        }

    }

    this.markAsSentToMongoDb = async (notification) => {
        let updateData = await MongodbPushMessage.update({
            _id: notification.id,
            isSent: 0,
            status: 1
        }, {
            isSent: 1,
            tsModifiedAt: Date.now(),
            sentAt: Date.now()
        })
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while mark as sent',
                    error: err
                }
            })
        if (updateData && updateData.error && (updateData.error !== null)) {
            return false;
        } 
        return true;
    }


}
module.exports = notificationsController
