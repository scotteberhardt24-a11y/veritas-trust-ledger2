const express=require("express"),router=express.Router(),db=require("../db/db"),auth=require("../middleware/auth");
router.get("/stats",auth,async(r,s)=>{try{const u=await db.query("SELECT name FROM users WHERE user_id=$1",[r.user.userId]);const code=`VTL-${(u.rows[0]?.name||'USER').toUpperCase().slice(0,4)}-REF`;s.json({code,total:0,joined:0,pending:0,tier:'Starter'});}catch(e){s.status(500).json({error:"Failed"});}});
router.post("/track",async(r,s)=>{try{const{referralCode,referredEmail}=r.body;if(!referralCode)return s.status(400).json({error:"Code required"});s.json({success:true});}catch(e){s.status(500).json({error:"Failed"});}});
module.exports=router;
