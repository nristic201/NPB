const express= require('express')
const routes= express.Router();

const returnRoouter =(io)=>{
    const login =require('./routes/login')

    routes.use('/login',login)

    return routes;
}

module.exports=returnRoouter;