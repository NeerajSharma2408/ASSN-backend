const Friend = require("../model/Friend");
const User = require("../model/User")

const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 900, checkperiod: 1000 });

const getUser = async (req, res)=>{
    let userID = req.params.userID
    if(userID){
        const communityUser = await User.findById(userID).select('-Email -Password -Groups');
        if(communityUser){
            const isFriend = await Friend.exist({$or: [{Recipient: req.id}, {Recipient: userID}, {Requester: req.id}, {Requester: userID}]});
            communityUser.isFriend = isFriend
            res.status(200).json({message: "User Found", user: communityUser})
        }else{
            res.status(400).json({message: "User Not Found"})
        }
    }else{
        let user = await User.findById(req.id).select('-Password')
        if(!user)
        res.status(400).json({message: "User Doesn't Exist. Illegal Request."})
        else{
            res.status(200).json({message: "User Found", user: user})
        }
    }
}

const searchFriends = async (req, res)=>{
    const usernameOrName = req.params.userName
    let friends = myCache.get(req.id)
    if(!friends){
        friends = await Friend.find({$and: [{$or: [{'Requester': req.id}, {'Recipient': req.id}]}, {Status: 3}]})
        let matches = friends.map(friend=>{
            return (friend.Recipient).toString() == req.id ? friend.Requester : friend.Recipient;
        })
        friends = await User.find({'_id': {$in: matches}}).select('_id Username Name Avatar')
        myCache.set(req.id, {friends}, 900)
    }
    matches = friends.filter(friend=>{
        return ((friend.Username).includes(usernameOrName)) || ((friend.Name).includes(usernameOrName));
    })
    if(matches.length > 0)
        res.status(200).json(matches)
    else
        res.status(404).json({message: "No Matching User Found"})
}

const searchCommunity = async (req, res)=>{
    const usernameOrName = req.params.userName

    const userCommunity = await User.findById(req.id).select('Community')

    let communityMembers = myCache.get(userCommunity)
    if(!communityMembers){
        communityMembers = await User.find({Community: userCommunity}).select('_id Username Name Avatar')
        myCache.set(userCommunity, {communityMembers}, 900)
    }
    const matches = communityMembers.filter(communityMember=>{
        return ((communityMember.Username).includes(usernameOrName)) || ((communityMember.Name).includes(usernameOrName));
    })
    if(matches.length > 0)
        res.status(200).json(matches)
    else
        res.status(404).json({message: "No Matching User Found"})
}

module.exports = {getUser, searchCommunity, searchFriends}