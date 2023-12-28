const { toggleReaction, getReactions } = require("../controller/reactController")

const reactRouter = require("express").Router()

reactRouter.route('/:parentId')

// GET ALL REACTION ROUTE
    .get(getReactions)

// CREATE A REACTION ROUTE
    .post(toggleReaction)

// UPDATE A REACTION ROUTE
    .patch(toggleReaction)
    .put(toggleReaction)

// DELETE A REACTION ROUTE
    .delete(toggleReaction);

module.exports = reactRouter