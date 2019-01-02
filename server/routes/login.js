let express= require('express')
let router= express.Router();


router.get('/login',(req,res)=>{
    res.status(200).send({msg:'its ok '})
})

module.exports=router;