

export default async (req,res)=>{
  try{
    const {payload,mode} = JSON.parse(req.body);
    const key = process.env.GEMINI_API_KEY;
    if(!key) throw new Error("Missing GEMINI_API_KEY");
    const url=`https://generativelanguage.googleapis.com/v1beta/models/${mode||"gemini-2.0-pro"}:generateContent?key=${key}`;
    const r=await fetch(url,{method:"POST",headers:{ "Content-Type":"application/json"},body:JSON.stringify(payload)});
    return res.status(200).json(await r.json());
  }catch(e){return res.status(500).json({error:e.message})}
};
