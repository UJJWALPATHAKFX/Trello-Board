
const users = [{
    id:1,
    username:"Ujjwal",
    password:"12345"
},{
    id:2,
    username:"raman",
    password:"123456"
}];
const organizations = [{
    id:1,
    title:"100xdevs",
    description: "Learning backend",
    admin: 1,
    members:[2]
},{
    id:2,
    title:"raman org",
    description: "Learning backend full ",
    admin: 2,
    members:[2]
}];
const boards = [{
    id:1,
    title:"100xschool website frontend",
    organizationId:1
}];
const issues = [{
    id:1,
    title:"Add dark mode",
    boardId: 1
},
{
    id:2,
    title:"Add like pop up feature",
    boardId: 1 
}];