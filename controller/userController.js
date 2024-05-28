const Friend = require("../model/Friend");
const User = require("../model/User")

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 600, checkperiod: 660 });

const expressAsyncHandler = require('express-async-handler');
const { default: mongoose } = require("mongoose");
const Post = require("../model/Post");

const getUser = expressAsyncHandler(async (req, res) => {
    let userID = req.params.userID
    if (userID) {
        let communityUser = await User.findById(userID).select("-Password -Email -Community");
        if (communityUser) {
            const isFriend = await Friend.exists({ $or: [{ Recipient: res.locals.id }, { Recipient: userID }, { Requester: res.locals.id }, { Requester: userID }] });
            res.status(200).json({ message: "User Found", user: communityUser, isFriend })
        } else {
            res.status(400).json({ message: "User Not Found" })
        }
    } else {
        let user = await User.findById(res.locals.id).select('-Password')
        if (!user)
            res.status(400).json({ message: "User Doesn't Exist. Illegal Request." })
        else {
            res.status(200).json({ message: "User Found", user: user })
        }
    }
})

const getProfileCount = expressAsyncHandler(async (req, res)=>{
    const { userID } = req.params;

    if(!userID || !mongoose.isValidObjectId(userID)){
        res.status(400);
        throw new Error("Invalid User ID sent")
    }

    const friendsCount = await Friend.countDocuments({Status: 3, $or: [{Requester: userID}, {Recipient: userID}]});
    const postCount = await Post.countDocuments({By: userID});

    res.status(200).json({message: "Counts Fetched", postCount, friendsCount})
})

const getCommunityUsers = expressAsyncHandler(async (req, res)=>{

    const user = await User.findById(res.locals.id).select('Community');

    const communityUsers = await User.find({community: user.Community}).select('-Password -Email');

    res.status(200).json({message: "Community Users Fetched", communityUsers});
})

const searchFriends = expressAsyncHandler(async (req, res) => {
    const usernameOrName = req.params.userName
    let friends = myCache.get((res.locals.id).toString())
    if (!friends) {
        friends = await Friend.find({ $and: [{ Status: 3 }, { $or: [{ 'Requester': res.locals.id }, { 'Recipient': res.locals.id }] }] })
        let matches = friends.map(friend => {
            return (friend.Recipient).toString() == res.locals.id ? friend.Requester : friend.Recipient;
        })
        friends = await User.find({ '_id': { $in: matches } }).select('_id Username Name Avatar')
        myCache.set((res.locals.id).toString(), friends, 600)
    }
    matches = friends.filter(friend => {
        return ((friend.Username).includes(usernameOrName)) || ((friend.Name).includes(usernameOrName));
    })
    if (matches.length > 0)
        res.status(200).json(matches)
    else
        res.status(404).json({ message: "No Matching User Found" })
})

const searchCommunity = expressAsyncHandler(async (req, res) => {
    const usernameOrName = req.params.userName

    const userCommunity = await User.findById(res.locals.id).select('Community')

    let communityMembers = myCache.get(userCommunity.Community)
    if (!communityMembers) {
        communityMembers = await User.find({ Community: userCommunity.Community }).select('Name Username Avatar')
        myCache.set(userCommunity.Community, communityMembers, 600)
    }
    const matches = communityMembers.filter(communityMember => {
        return ((communityMember.Username).includes(usernameOrName)) || ((communityMember.Name).includes(usernameOrName));
    })
    if (matches.length > 0)
        res.status(200).json(matches)
    else
        res.status(404).json({ message: "No Matching User Found" })
})

const updateProfile = expressAsyncHandler(async (req, res) => {
    const userID = res.locals.id;

    const {Name, DOB, Gender, Avatar, Bio, isPrivateAccount} = req.body;

    const user = await User.findById(userID);

    if(!user){
        throw new Error("User Not Found");
    }

    const userObj = {
        Name: Name ?? user.Name,
        DOB: DOB ?? user.DOB, 
        Gender: Gender ?? user.Gender, 
        Avatar: Avatar ?? user.Avatar, 
        Bio: Bio ?? user.Bio, 
        isPrivateAccount: isPrivateAccount ?? user.isPrivateAccount
    }

    const updatedUser = await User.findByIdAndUpdate(userID, userObj);
    res.status(200).json({message: "User Updated", updatedUser});
})

module.exports = { getUser, getProfileCount, getCommunityUsers, searchCommunity, searchFriends, updateProfile }