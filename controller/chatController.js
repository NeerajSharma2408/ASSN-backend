const expressAsyncHandler = require("express-async-handler")

const Message = require('../model/Message')
const Group = require('../model/Group');
const Post = require("../model/Post");
const Comment = require("../model/Comment");

// const OpenAI = require("openai");
// const readlineSync = require("readline-sync"); 

const generateIcebreakers = require("../utils/gemini");

const getOneLiners = expressAsyncHandler(async (req, res) => {
    // ONE VARIABLE CAN BE INTRODUCED WHICH CAN BE USED TO GET THE LAST X NUMBER OF INTERATIONS OF THE COMMUNITY USER 
    // ALSO REACTION DOCUMENTS CAN BE USED TO GET THE POSTS OR TYPE OF MESSAGES THAT THE USER LIKES
    const userID = res.locals.id;
    const communityUserID = req.params.user;

    // let one_liners = [];
    let one_liner_count = 0;

    const friendPosts = await Post.find({By: communityUserID}).select('Content Caption').limit(20);
    const friendComments = await Comment.find({By: communityUserID}).select('Message').limit(20);

    // const promtMessage = "You want to start some interesting conversations. You decide to use their recent social post's captions and comments as inspiration for ice breakers without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: ";

    let promtData = '';

    // const promtOutput = 'Generate the ice breakers in the form of array of strings.';

    // You want to start some interesting conversations. You decide to use their recent social media post captions and comments as inspiration for ice breakers, without addressing any emotional or personal moments. Here are some of their recent posts and comments: 1. Exploring new hobbies is always fun!, 2. Just finished reading an amazing book!, 3. Spent the weekend hiking in the mountains!, 4. Trying out new recipes in the kitchen! 5. Enjoying a quiet night in with some hot chocolate!. Generate ice breakers or conversation starters based on the provided captions and comments.

    friendPosts?.map(({Content, Caption})=>{
        promtData += `${++one_liner_count}. ${Content || ''}`;
        promtData += `${++one_liner_count}. ${Caption?.length > 5 ? Caption : ''}`;
    });
    friendComments?.map(({Message})=>{
        promtData += `${++one_liner_count}. ${Message?.length > 5 ? Message : ''}`;
    });

    // const prompt = promtMessage + promtData + '. ' + promtOutput;

    // const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY1 });

    // You want to start some interesting conversations. You decide to use their recent social media posts as inspiration for some context for ice breakers without addressing any emotional or personal moments. Here are some of their recent posts and their messages along with liked messages: 1. yeah and uk he said aman is not so good 2. i think brazil is better destination than paris. 3. cant believe i am this stupid

    // Generate ice-breakers or pickup lines based on a user's recent social media activity. Below are some of their recent posts and comments:

    // 1. yass go queen
    // 2. hehehe
    // 3. lets go to brazil
    // 4. i just loved it
    // 5. great trip it was.
    // 1. yass go queen, 2. hehehe, 3. lets go to brazil, 4. i just loved it, 5. great trip it was.

    // Craft ice-breakers keeping in mind that its my first interation with the user, so generate an json array of ice-breakers, avoiding any personal or emotional moments as given {ice-breakers: []}.
    
    // const messageList = [
    //     { "role": "user", "content": prompt }
    // ]
    // const GPTOutput = await openai.chat.completions.create({
    //     messages: messageList,
    //     model: "gpt-3.5-turbo",
    // });

    // const output_text = GPTOutput;
    // console.log(output_text);
    
    // one_liners = [...output_text];
    
    //

    let text = '';
    if(promtData.length < 50){
        res.status(401);
        throw new Error("User doesn't have enough data to generate Ice Breakers") 
    }else{
        text = await generateIcebreakers(promtData);
    }

    res.status(200).json({messsage: "Ice breakers feached", text});
});

// !depreciated controller

const getAllChatHeads = expressAsyncHandler(async (req, res) => {

    const selfId = res.locals.id;
    const limit = req.query.limit ?? 15;
    const page = req.query.page ?? 1;

    const allChatHeads = await Group.find({ Members: { $eq: selfId } }).skip((page - 1) * limit).limit(limit).exec();

    res.status(200).json({ message: "ALL CHAT HEAD FOUND", allChatHeads });
});

const getAllMessage = expressAsyncHandler(async (req, res) => {

    const selfId = res.locals.id;
    const groupId = req.params.groupId;
    const limit = req.query.limit ?? 50;
    const page = req.query.page ?? 1;

    if (!groupId) {
        res.status(404)
        throw new Error("Group id Not Present")
    }

    const group = await Group.exists({ _id: groupId });

    if (!group) {
        res.status(400)
        throw new Error("Group does Not Exist for given Group Id")
    }

    const messages = await Message.find({ InGroup: groupId, isDeleted: false }).skip((page - 1) * limit).limit(limit).exec();

    res.status(200).json({ message: "ALL MESSAGES FETCHED", messages })
});

module.exports = { getAllChatHeads, getAllMessage, getOneLiners }

// controller (folder)
//     authController.js
//     chatController.js
//     commentController.js 
//     dashboardController.js 
//     friendController.js 
//     notificationController.js 
//     postController.js 
//     reactController.js 
//     userController.js 
// enums (folder)
//     socketEnums.js 
// lib (folder)
//     ConnectedUsers.js 
//     impressionConstants.js 
// middleware (folder)
//     errorHandler.js 
//     sessionAuth.js 
// model (folder)
//     Comment.js 
//     Friend.js 
//     Group.js
//     JWT.js 
//     Message.js 
//     Notification.js
//     Otp.js 
//     Post.js 
//     Reaction.js 
//     User.js 
// node_modules (folder)
// routes (folder)
//     authRoutes.js 
//     chatRoutes.js 
//     commentRoutes.js 
//     dashboardRoutes.js 
//     friendRoutes.js 
//     notificationRoutes.js 
//     postRoutes.js 
//     reactRoutes.js 
//     userRoutes.js 
// services (folder)
//     sockets.js 
//     temp.js 
// utils (folder)
//     bcyptHash.js 
//     chatAuth.js 
//     connect_db.js 
//     cryptoHash.js 
//     jwt.js
//     mail.js 
//     otp.js 
//     postAuth.js 
//     updatePostImpressions.js 
// .env
// .gitignore 
// index.js 
// package-lock.json 
// package.json 
