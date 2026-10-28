// وسيط المساعد الذكي لرياحين — Cloudflare Worker
// المتغيرات (Settings → Variables and Secrets): ANTHROPIC_API_KEY (سري) — وإن شئتِ: MODEL, DAILY_LIMIT, ALLOWED_ORIGINS
const DEFAULTS={
  MODEL:"claude-haiku-4-5",
  DAILY_LIMIT:"25",
  ALLOWED_ORIGINS:"https://maryamalshnini-hash.github.io,https://claude.ai,http://localhost,capacitor://localhost,https://localhost",
  FIREBASE_API_KEY:"AIzaSyCnYvTcWLjyBaFlNtpaIXAnhE43kUglenY",
  REQUIRE_LOGIN:"true"
};
const SYSTEM=`أنتِ «مساعدة رياحين»، معلّمة تجويد وحفظ لطيفة في حلقة قرآنية للطالبات، تعملين داخل تطبيق «رياحين».
المرجع المعتمد: كتاب «هدي المجيد في أحكام التجويد» (رواية حفص عن عاصم). التزمي بمصطلحاته وأحكامه، ولا تخرجي عنها إلى خلافات لا تنفع الطالبة.
القواعد:
- أجيبي بالعربية الفصحى المبسّطة، بإيجاز ووضوح، وخاطبي الطالبة بصيغة المؤنث، ومثّلي بآيات من القرآن مع ضبطها.
- حين تُعطَين سياق الطالبة (درسها الحالي، نتائج تلاوتها، مهام حفظها) فابني الجواب عليه.
- عند شرح خطأ تلاوة: سمّي الحكم، واذكري موضعه في الكلمة، وكيف تنطقه صحيحًا، وتمرينًا قصيرًا.
- لا تفتي في مسائل فقهية أو عقدية خارج التجويد والحفظ؛ وجّهي الطالبة لسؤال أستاذة الحلقة.
- لا تخترعي أحاديث أو أقوالًا؛ إن لم تتأكدي قولي ذلك.
- استعملي عناوين قصيرة ونقاطًا (- ) عند الحاجة، واجعلي الرد في حدود 150 كلمة ما لم يُطلب التفصيل.`;
const dayUse=new Map();
function cors(origin,env){ const list=(env.ALLOWED_ORIGINS||DEFAULTS.ALLOWED_ORIGINS).split(",").map(s=>s.trim()); const ok=!origin||list.some(o=>origin===o||origin.startsWith(o)); return {ok,headers:{"Access-Control-Allow-Origin":ok&&origin?origin:list[0],"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"}}; }
async function verifyUser(token,env){ if(!token) return null; const key=env.FIREBASE_API_KEY||DEFAULTS.FIREBASE_API_KEY; const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:token})}); if(!r.ok) return null; const j=await r.json(); const u=j.users&&j.users[0]; return u?{uid:u.localId,email:u.email||""}:null; }
function ctxText(c){ if(!c) return ""; const L=[]; if(c.name) L.push(`اسم الطالبة: ${c.name}`); if(c.role==="teacher") L.push("المستخدمة: أستاذة الحلقة"); if(c.level) L.push(`مستواها: ${c.level}`); if(c.track) L.push(`مسارها: ${c.track}`); if(c.lessonTitle) L.push(`درسها الحالي: «${c.lessonTitle}»${c.lessonDone?" (أنهته)":""}`); if(c.lessonSummary) L.push(`ملخص الدرس من الكتاب:\n${c.lessonSummary}`); if(c.lastAttempts&&c.lastAttempts.length) L.push(`آخر نتائج تلاوتها:\n- ${c.lastAttempts.join("\n- ")}`); if(c.hifzToday) L.push(`مهام حفظها اليوم: ${c.hifzToday}`); return L.length?`\n\n[سياق الطالبة]\n${L.join("\n")}`:""; }
export default{
  async fetch(req,env){
    const origin=req.headers.get("Origin")||""; const C=cors(origin,env);
    if(req.method==="OPTIONS") return new Response(null,{headers:C.headers});
    const url=new URL(req.url);
    if(url.pathname==="/"||url.pathname==="/health") return new Response(JSON.stringify({ok:true,service:"rayaheen-ai",keySet:!!env.ANTHROPIC_API_KEY}),{headers:{"Content-Type":"application/json",...C.headers}});
    if(req.method!=="POST"||url.pathname!=="/chat") return new Response("Not found",{status:404,headers:C.headers});
    const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"Content-Type":"application/json; charset=utf-8",...C.headers}});
    if(!C.ok) return J({error:"المصدر غير مسموح"},403);
    if(!env.ANTHROPIC_API_KEY) return J({error:"لم يُضبط مفتاح ANTHROPIC_API_KEY في الوسيط"},500);
    let body; try{ body=await req.json(); }catch(e){ return J({error:"طلب غير صالح"},400); }
    let who=null; if((env.REQUIRE_LOGIN||DEFAULTS.REQUIRE_LOGIN)==="true"){ who=await verifyUser(body.token,env); if(!who) return J({error:"سجّلي الدخول أولًا لاستخدام المساعد"},401); }
    const id=who?who.uid:(req.headers.get("CF-Connecting-IP")||"anon"); const day=new Date().toISOString().slice(0,10); const k=id+"|"+day; const n=(dayUse.get(k)||0)+1; const lim=+(env.DAILY_LIMIT||DEFAULTS.DAILY_LIMIT); if(n>lim) return J({error:`بلغتِ الحد اليومي (${lim} سؤالًا)`},429); dayUse.set(k,n);
    const msgs=(Array.isArray(body.messages)?body.messages:[]).filter(m=>m&&(m.role==="user"||m.role==="assistant")&&typeof m.content==="string").slice(-12).map(m=>({role:m.role,content:m.content.slice(0,4000)}));
    if(!msgs.length||msgs[msgs.length-1].role!=="user") return J({error:"لا سؤال"},400);
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:env.MODEL||DEFAULTS.MODEL,max_tokens:700,system:SYSTEM+ctxText(body.context),messages:msgs})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok) return J({error:(j.error&&j.error.message)||"تعذّر الاتصال بالنموذج"},502);
    const text=(j.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("\n").trim();
    return J({text});
  }
};
