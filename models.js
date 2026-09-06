require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
const userSchema = mongoose.Schema({
    username: String,
    password: String
})
const organizationSchema = mongoose.Schema({
    title: String,
    description: String,
    admin: mongoose.Types.ObjectId,
    members: [mongoose.Types.ObjectId]
})
const boardSchema = new mongoose.Schema({
    title: String,
    organizationId: mongoose.Schema.Types.ObjectId
})
const issueSchema = new mongoose.Schema({
    title: String,
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"boards"
    },
    state:{
        type:String,
        default:"TODO"
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    dueDate: Date,
    dueTime: String,
    assigneeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    }
});
const organizationModel = mongoose.model("organizations", organizationSchema);
const userModel = mongoose.model("users", userSchema);
const boardModel = mongoose.model("boards",boardSchema);
const issueModel = mongoose.model("issues",issueSchema);

module.exports = {
    organizationModel,
    userModel,
    boardModel,
    issueModel
}