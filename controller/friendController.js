const expressAsyncHandler = require("express-async-handler");

const Friend = require('../model/Friend');
const { default: mongoose } = require("mongoose");

const getFriends = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;

    if(mongoose.isValidObjectId(userID)) throw new Error("Invalid user ID");

    const friends = await Friend.find({ $and: [ { $or: { Requester: userID, Recipient: userID } }, { Status: 3 } ] });
    
    res.status(200).json({message: "Friends Fetched", friends});
});

const getRequests = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;
    
    if(mongoose.isValidObjectId(userID)) throw new Error("Invalid user ID");

    const requests = await Friend.find({ $and : {Recipient: userID, Status: 1}});

    res.status(200).json({message: "Requests Fetched", requests});
});

const rejectRequest = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;
    const requestID = req.params.id;

    if(!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(requestID)) throw new Error("Invalid User Id or Request Id provided");

    const request = await Friend.findById(requestID);
    
    if(!request) throw new Error("Request not found");

    if(request.Requester !== userID) throw new Error("User Doesn't have Write permissions for this Request");

    const rejectedRequest = await Friend.findByIdAndUpdate(requestID, { Status: 2 });

    res.status(200).json({message: "Request Rejected", rejectedRequest});
});

const addRequest = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;
    const communityMemberID = req.params.communitymember;

    if(!mongoose.isValidObjectId(userID) || !mongoose.isValidObjectId(communityMemberID)) throw new Error("Invalid User Id or Community Member Id provided");

    const requestObj = {
        Requester: userID,
        Recipient: communityMemberID,
        Status: 1
    }
    const request = await Friend.create(requestObj);

    res.status(200).json({message: "Request Toggled", request});
})

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

module.exports = { getFriends, getRequests, rejectRequest, addRequest, deleteRequest }