const expressAsyncHandler = require("express-async-handler");

const Friend = require('../model/Friend');
const { default: mongoose } = require("mongoose");
const { sendRequestNotification } = require("./notificationController");

const getFriends = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;

    if(!mongoose.isValidObjectId(userID)) throw new Error("Invalid user ID");

    const friends = await Friend.find({ $and: [ { $or: { Requester: userID, Recipient: userID } }, { Status: 3 } ] });
    
    res.status(200).json({message: "Friends Fetched", friends});
});

const removeFriend = expressAsyncHandler(async (req, res) => {
    const user = req.params.user;
    const userID = res.locals.id;

    if(!mongoose.isValidObjectId(user)) throw new Error("Invalid user ID");

    let request = await Friend.findOne({ $and: [
        { $or: [
            {Requester: userID, Recipient: communityMemberID}, 
            {Recipient: userID, Requester: communityMemberID}
            ]
        }, 
        {status: 3}
    ]});
    if(request){
        request = await Friend.findByIdAndUpdate(request.id, {status: 0});
        res.status(200).json({message: "Friend Removed", request});
    }else{
        res.status(400).json({message: "Provided user is not a Friend"});
    }
});

const getRequests = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;
    
    if(userID && !mongoose.isValidObjectId(userID)) throw new Error("Invalid user ID");

    const requests = await Friend.find({ $and : [{Recipient: userID}, {Status: 1}]});

    res.status(200).json({message: "Requests Fetched", requests});
});

const rejectRequest = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;
    const requestID = req.params.request;

    if(!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(requestID)) throw new Error("Invalid User Id or Request Id provided");

    const request = await Friend.findById(requestID);
    
    if(!request) throw new Error("Request not found");

    if(request.Requester !== userID) throw new Error("User Doesn't have Write permissions for this Request");

    const rejectedRequest = await Friend.findByIdAndUpdate(requestID, { Status: 2 });

    sendRequestNotification(req.app.io, userID, request, request.Requester, "remove");

    res.status(200).json({message: "Request Rejected", rejectedRequest});
});

const addRequest = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;
    const communityMemberID = req.params.user;

    if(userID === communityMemberID) {
        res.status(400);
        throw new Error("Invalid Request");
    }

    if(!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(communityMemberID)) throw new Error("Invalid User Id or Community Member Id provided");

    let request = await Friend.findOne({$and: [
        { $or: [
            {Requester: userID, Recipient: communityMemberID}, 
            {Recipient: userID, Requester: communityMemberID}
        ]}, 
        { $or: [
            {status: 0}, 
            {status: 2}
        ]}
    ]});
    if(request){
        request = await Friend.findByIdAndUpdate(request.id, {status: 1});
    }else{
        const requestObj = {
            Requester: userID,
            Recipient: communityMemberID,
            Status: 1
        }
        request = await Friend.create(requestObj);
    }

    sendRequestNotification(req.app.io, userID, request, request.Requester, "add");

    res.status(200).json({message: "Request Toggled", request});
});

const acceptRequest = expressAsyncHandler( async (req, res) => {
    const userID = res.locals.id;
    const requestID = req.params.request;

    if(!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(requestID)) throw new Error("Invalid User Id or Request Id provided");

    const request = await Friend.findById(requestID);
    
    if(!request) throw new Error("Request not found");

    if(request.Recipient !== userID) throw new Error("Invalid Request");

    const acceptedRequest = await Friend.findByIdAndUpdate(requestID, { Status: 3 });

    sendRequestNotification(req.app.io, userID, request, request.Requester, "accept");

    res.status(200).json({message: "Request Rejected", acceptedRequest});
});

const deleteRequest = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;
    const requestID = req.params.request;

    if(!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(requestID)) throw new Error("Invalid User Id or Request Id provided");

    const request = await Friend.findById(requestID);

    if(!request) throw new Error("Request not found");

    if(request.Requester !== userID) throw new Error("User Doesn't have Write permissions for this Request");

    const deletedRequest = await Friend.findByIdAndDelete(requestID);

    res.status(200).json({message: "Request Toggled", deletedRequest});
});

module.exports = { getFriends, getRequests, rejectRequest, addRequest, acceptRequest, deleteRequest, removeFriend }