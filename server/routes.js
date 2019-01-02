const express = require('express')
const router = express.Router();

const returnRouter=()=>{
    const login= require('./routes/login')

    router.use('/login',login);
}

module.exports=returnRouter;