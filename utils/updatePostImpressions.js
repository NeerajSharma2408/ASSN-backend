const Post = require("../model/Post")

const updatePostImpressions = async (postID, impression)=>{
    try {
        const post = await Post.findByIdAndUpdate(postID, { $inc : {"Impressions": impression} }, { new: true })
    } catch (error) {
        console.log("Error: ", error)
    }
}

module.exports = updatePostImpressions