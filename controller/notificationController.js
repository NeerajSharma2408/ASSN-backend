const expressAsyncHandler = require("express-async-handler")

const Notification = require('../model/Notification')

const getAllNotification = expressAsyncHandler( async (req, res)=>{

    const selfId = res.locals.id;
    const limit = req.query.limit ?? 15;
    const page = req.query.page ?? 1;

    const allNotifications = await Notification.find({To: selfId, isDeleted: false});
    
    res.status(200).json({message: "ALL NOTIFICATIONS Fetched", allNotifications}).skip((page - 1) * limit).limit(limit).exec();
});

const deleteAllNotification = expressAsyncHandler( async (req, res)=>{

    const selfId = res.locals.id;

    const allNotifications = await Notification.updateMany({To: selfId, isDeleted: false}, {isDeleted: true});
    res.status(200).json({message: "ALL NOTIFICATIONS DELETED", allNotifications})
});

const deleteNotification = expressAsyncHandler( async (req, res)=>{

    const selfId = res.locals.id;
    const notificationId = req.params.notificationId;

    if(!notificationId) throw new Error("notification Id is not Present")

    const notificationExists = await Notification.exists({ id: notificationId });

    if(!notificationExists) {
        res.status(404)
        throw new Error("Notification doesn't exists for given Id")
    }

    const deletedNotification = await Notification.findByIdAndUpdate(notificationId, {isDeleted: true});
    res.status(200).json({message: "NOTIFICATION DELETED", deletedNotification})
});



module.exports = { getAllNotification, deleteAllNotification, deleteNotification }