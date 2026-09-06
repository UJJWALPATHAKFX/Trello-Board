const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose =  require("mongoose");
const { authMiddleware } = require("./middleware");
const {userModel,organizationModel,boardModel,issueModel} = require("./models");

let USERS_ID=1;
let ORGANIZATIONS_ID=1;
let BOARDS_ID=1;
let ISSUES_ID=1;
const USERS = [ ];
const ORGANIZATION = [];
const BOARDS = [{
    id:1,
    title:"100xschool website frontend",
    organizationId:1
}];
const ISSUES = [{
    id:1,
    title:"Add dark mode",
    boardId: 1,
    state:"In_PROGRESS"
},
{
    id:2,
    title:"Add like pop up feature",
    boardId: 1 ,
    state:"DONE"
}];
 
const app = express();
app.use(express.json())
//CREATE EPs
app.post("/signup",async function(req,res){
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();
    if(!username){
        return res.status(400).json({
            message:"username is required"
        })
    }
    if(!password){
        return res.status(400).json({
            message:"password is required"
        })
        
    }
    const userexist = await userModel.findOne({
        username: username
    });
    if(userexist){
        return res.status(403).json({
            message:"User with this username already exist"
        })
        
    }
    const newUser = await userModel.create({
        username: username,
        password: password
    })
    res.status(201).json({
        id: newUser._id,
        message:"You signedup successfully"
    })
})
app.post("/signin",async function(req,res){
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();
    if(!username){
        return res.status(400).json({
            message:"username is required"
        })
    }
    if(!password){
        return res.status(400).json({
            message:"password is required"
        })
        
    }
    const userExist = await userModel.findOne({
        username,
        password
    })
    if(!userExist){                                                                  
        return res.status(401).json({
            message:"Invalid credentials"
        })
    }
    const token = jwt.sign({
        userId:userExist._id
    },"Attlasian123");
    return res.status(200).json({
        token: token
    })

})
// AUTHENTICATED ROUTE -MIDDLEWARE REQUIRED
app.post("/organizations",authMiddleware,async function(req,res){
    const userId = req.userId;
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
    if(!title){
        return res.status(400).json({
            message:"Title is missing"
        })
    }
    if(!description){
        return res.status(400).json({
            message:"Description is missing"
        })
    }
    const titleexist = await organizationModel.findOne({
        title: title,
        admin: userId
    })
    if(titleexist){
        return res.status(409).json({
            message:"You already have an organization with this name."
        })  
    }
    const newOrg = await organizationModel.create({
        title,
        description,
        admin:userId,
        members:[userId]
    })
    return res.status(201).json({
        message : "Organization created succ",
        id: newOrg._id
    })
})
app.post("/organizations/:organizationId/boards",authMiddleware,async function(req,res){
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const organizationId = req.params.organizationId;
    const organizationObjectId = new mongoose.Types.ObjectId(organizationId);
    const title = req.body.title?.trim();
    if(!title){
        return res.status(400).json({
            message:"title is missing"
        });
    }
    const existingOrganization = await organizationModel.findOne({
        _id: organizationObjectId
    })
    if(!existingOrganization){
        return res.status(404).json({
            message:"Organization does not exist"
        })
    }
    const userIsmember = existingOrganization.members.includes(userObjectId);
    if(!userIsmember){
        return res.status(403).json({
            message:"forbidden request"
        })
    }
    const newBoard = await boardModel.create({
        title,
        organizationId: organizationObjectId
    })
    return res.status(201).json({
        message:"Board created successfully",
        id: newBoard._id
    })  

})
app.post("/organizations/:organizationId/members",authMiddleware,async function(req,res){
    const userId = req.userId;
    const organizationId = req.params.organizationId;
    const memberUserName = req.body.memberUserName;
    const organizationExist = await organizationModel.findOne({
        _id:organizationId
    });
    
    if(!organizationExist){
        return res.status(404).json({
            message:"Organization does not exist"
        })
    }
    const isAdmin = organizationExist.admin.equals(userId);
    if(!isAdmin){
        return res.status(403).json({
            message:"Forbidden request"
        })
    }
    const isUser = await userModel.findOne({
        username: memberUserName
    })
    if(!isUser){
        return res.status(404).json({
            message:"User does not exist"
        })
    }
    const isMember = organizationExist.members.some(
        member => member.equal(isUser._id)
    );
    if(isMember){
        return res.status(409).json({
            message:"Member already exist"
        })
    }
    organizationExist.members.push(isUser._id);
    
    await organizationExist.save();
    return res.status(200).json({
        message:"Member added successfully"
    })
})
app.post("/boards/:boardId/issues",authMiddleware,async function(req,res){
    const userId = req.userId;
    const boardId = req.params.boardId;
    const title = req.body.title?.trim();
    const dueDate = req.body.dueDate;
    const dueTime = req.body.dueTime;
    const assigneeId = req.body.assigneeId;
    if(!assigneeId){
        return res.status(400).json({
            message:"Assignee id is required"
        })
    }

    if(!title){
        return res.status(400).json({
            message:"Title is required"
        })
    }
    const boardExist = await boardModel.findOne({
        _id:boardId
    });
    if(!boardExist){
        return res.status(404).json({
            message:"Board does not exist"
        })
    }
    const organization = await organizationModel.findOne({
        _id: boardExist.organizationId
    });
    if(!organization){
        return res.status(404).json({
            message:"Organization does not exist"
        })
    }
    const memberExist = organization.members.some(
        member => member.equals(userId)
    );
    if(!memberExist){
        return res.status(403).json({
            message:"User is not the member of organization"
        })
    }
    const assigneeExist = organization.members.some(
        member => member.equals(assigneeId)
    );
    if(!assigneeExist){
        return res.status(403).json({
            message:"Assignee is not the member of organization"
        })
    }
    const newIssue = await issueModel.create({
        title,
        boardId,
        dueDate,
        dueTime,
        assigneeId
    })
    return res.status(201).json({
        message:"Issue created successfully",
        id: newIssue._id
    });
})
//READ EPs
app.get("/organizations",function(req,res){

})
app.get("/boards",function(req,res){

})
app.get("/issues",function(req,res){
    
})

app.get("/members",function(req,res){
    
})
//UPDATE EPs
app.put("/issues/:issueId",authMiddleware,async function(req,res){
    const issueId = req.params.issueId;
    const state = req.body.state;
    if(!state){
        return res.status(400).json({
            message:"State required"
        })
    }
    const issueExist = await issueModel.findOne({
        _id: issueId
    })
    if(!issueExist){
        return res.status(404).json({
            message:"Issue does not exist"
        })
    }
    issueExist.state = state;
    await issueExist.save();
    return res.status(200).json({
        message:"State updated successfully"
    })
})
//DELETE EPs
app.delete("/organizations/:organizationId/members/:memberId",authMiddleware,async function(req,res){
    const userId = req.userId;
    const organizationId = req.params.organizationId;
    const memberId = req.params.memberId;
    const organizationExist = await organizationModel.findOne({
        _id: organizationId
    })
    if(!organizationExist){
        return res.status(404).json({
            message:"organization doesn't exist"
        })
    }
    const isAdmin = organizationExist.admin.equals(userId);
    if(!isAdmin){
        return res.status(403).json({
            message:"Authorization failed"
        })
    }
    const memberIndex = organizationExist.members.findIndex(
        member => member.equals(memberId)
    );
    if(memberIndex === -1){
        return res.status(404).json({
            message:"Member does not exist in organization"
        })
    }
    organizationExist.members.splice(memberIndex,1);
    await organizationExist.save();
    return res.status(200).json({
        message:"Member deleted successfully"
    })  
})

app.listen(3000);
