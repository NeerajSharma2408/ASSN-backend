const { findByIdAndUpdate } = require("../model/Post")

const updatePostImpressions = async (postID, impression)=>{
    try {
        const post = await Post.findByIdAndUpdate(postID, {$inc: {Impression: impression}})
    } catch (error) {
        console.log("Error: ", err)
    }
}

module.exports = updatePostImpressions