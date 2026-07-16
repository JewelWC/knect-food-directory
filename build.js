// Rebuilds data.json (and downloads logos) from the KNECT Airtable base.
// Runs in GitHub Actions on a schedule. Needs env var AIRTABLE_TOKEN (a read-only
// Airtable personal access token). Base/table IDs below are not secret.
const fs = require("fs");
const path = require("path");

const BASE_ID  = "appAdDu6sYLdnxDw5";
const TABLE_ID = "tblvdNCSBOzzO3d2k"; // Organisations
const TOKEN = process.env.AIRTABLE_TOKEN;
if (!TOKEN) { console.error("Missing AIRTABLE_TOKEN"); process.exit(1); }

const LOGO_DIR = "logos";
const F = { name:"Name", segment:"Segment", subtype:"Sub-type", town:"Town / Locality",
  description:"Description", website:"Website", phone:"Public phone", email:"Public email",
  social:"Social media", logo:"Logo", show:"Show in public directory" };

async function airtable(offset){
  const params = new URLSearchParams();
  params.set("filterByFormula", "{"+F.show+"}=1");
  params.set("pageSize","100");
  if (offset) params.set("offset", offset);
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_ID)}?`+params;
  const res = await fetch(url, { headers:{ Authorization:`Bearer ${TOKEN}` }});
  if (!res.ok) throw new Error("Airtable "+res.status+" "+await res.text());
  return res.json();
}
async function download(url, dest){
  const res = await fetch(url);
  if(!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return true;
}
function ext(att){
  const t=(att.type||"").split("/")[1]||"";
  if(t==="jpeg") return "jpg";
  if(t) return t;
  const m=(att.filename||"").match(/\.([a-z0-9]+)$/i); return m?m[1].toLowerCase():"png";
}

(async ()=>{
  fs.mkdirSync(LOGO_DIR,{recursive:true});
  // clear old logos
  for(const f of fs.readdirSync(LOGO_DIR)) fs.unlinkSync(path.join(LOGO_DIR,f));

  let recs=[], offset;
  do { const page=await airtable(offset); recs=recs.concat(page.records); offset=page.offset; } while(offset);

  const out=[];
  for(const rec of recs){
    const f=rec.fields;
    let logo=null;
    const atts=f[F.logo];
    if(Array.isArray(atts)&&atts.length){
      const a=atts[0];
      const file=`${LOGO_DIR}/${rec.id}.${ext(a)}`;
      try{ if(await download(a.url,file)) logo=file; }catch(e){ console.warn("logo fail",f[F.name],e.message); }
    }
    out.push({
      name:f[F.name]||"", segment:f[F.segment]||"", subtype:f[F.subtype]||"",
      town:f[F.town]||"", description:f[F.description]||"", website:f[F.website]||"",
      phone:f[F.phone]||"", email:f[F.email]||"", social:f[F.social]||"", logo
    });
  }
  out.sort((a,b)=>a.name.localeCompare(b.name));
  const stamp=new Date().toLocaleDateString("en-NZ",{day:"numeric",month:"long",year:"numeric",timeZone:"Pacific/Auckland"});
  fs.writeFileSync("data.json", JSON.stringify({updated:stamp, org:"KNECT — Buller Food Network", records:out}, null, 1));
  console.log(`Wrote data.json with ${out.length} records, ${out.filter(r=>r.logo).length} logos.`);
})().catch(e=>{ console.error(e); process.exit(1); });
