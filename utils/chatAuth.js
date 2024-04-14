const Group = require("../model/Group");
const Message = require("../model/Message");
const User = require("../model/User");

const userHaveMessageWritePermission = async (userID, groupID, messageID) => {
    let group = await Group.findById(groupID);
    let user = await User.findById(userID);
    let message = await Message.findById(messageID);
    if (!group || !user || !message) {
        return new Error("Group/User/Message doesn't Exist");
    }

    if (message.InGroup !== groupID) {
        return new Error("Illegal Message and Group Id Provided")
    }
    if (message.Sender !== userID) {
        return false;
    } else {
        return true;
    }
}

module.exports = { userHaveMessageWritePermission }