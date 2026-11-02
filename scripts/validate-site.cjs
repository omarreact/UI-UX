// Validate every output route before deployment; no external packages.
(function validateSite(){
 "use strict";
 const fs=require("node:fs"),path=require("node:path");
 const dist=path.resolve(__dirname,"..","dist");
 const assert=(ok,msg)=>{if(!ok)throw Error("Static site validation failed: "+msg)};
 function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
 }
 const files=walk(dist),htmlFiles=files.filter(x=>x.endsWith(".html"));
 assert(htmlFiles.length===18,"Expected 18 HTML routes (8 pages, 9 details, 404), got "+htmlFiles.length);
 const scripts=fs.readFileSync(path.join(dist,"assets/js/site.js"),"utf8");
 try{new Function(scripts)}catch(e){throw Error("Invalid vanilla JavaScript syntax: "+e.message)}
 const cssFiles=["site.css","pages.css"];
 for(const file of cssFiles)assert(fs.existsSync(path.join(dist,"assets/css",file)),"Missing stylesheet "+file);
 const concepts=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../src/content/concepts.json"),"utf8"));
 const articles=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../src/content/articles.json"),"utf8"));
 assert(concepts.length===6&&articles.length===3,"Content catalog out of sync");
 const paths=new Set();
 for(const filename of htmlFiles){
  const html=fs.readFileSync(filename,"utf8");
  const relative=path.relative(dist,filename).split(path.sep).join("/");
  const route=relative==="index.html"?"/":relative==="404.html"?"/404.html":"/"+relative.replace(/index.html$/,"");
  paths.add(route);
  assert((html.match(/<h1(?:\s|>)/gi)||[]).length===1,route+": must have one H1");
  assert(/<main id="main-content">/.test(html)&&/<footer>/.test(html),route+": missing semantic layout");
  assert(/<meta name="description"/.test(html)&&/<link rel="canonical"/.test(html),route+": missing metadata");
  assert(/<link rel="stylesheet" href="\/assets\/css\/site.css">/.test(html),route+": missing shared stylesheet");
  assert(/<script type="module" src="\/assets\/js\/site.js"><\/script>/.test(html),route+": missing module script");
  assert(!/cdn\.tailwindcss|fonts\.googleapis|images\.unsplash|href=["']#["']/.test(html),route+": external dependency or dummy link");
  assert(!/Maya Thompson|Priya Shah|Alex Carter|Daniel Reed|★★★★★/.test(html),route+": unverified customer review");
  assert(!/\{\{[A-Z_]+\}\}/.test(html),route+": unresolved template token");
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert(new Set(ids).size===ids.length,route+": duplicate element IDs");
  const hrefs=[...html.matchAll(/\bhref="([^"]+)"/g)].map(m=>m[1]);
  for(const href of hrefs){
   if(href.startsWith("mailto:")||href.startsWith("data:")||href.startsWith("https:"))continue;
   const url=new URL(href,"https://agency.pincodeit.com"+route);
   assert(url.origin==="https://agency.pincodeit.com",route+": unexpected external URL "+href);
   if(url.hash && url.pathname===(route==="/404.html"?"/404.html":route)){
    assert(ids.includes(decodeURIComponent(url.hash.slice(1))),route+": missing anchor "+href);
   }
   const dest=url.pathname;
   if(dest==="/"||dest==="/404.html")continue;
   let local=dest.endsWith("/")?dest.slice(1)+"index.html":dest.slice(1);
   if(!path.extname(local))local+="/index.html";
   assert(fs.existsSync(path.join(dist,local)),route+": broken internal link "+href);
  }
  const imgRefs=[...html.matchAll(/(?:src|href)="(\/assets\/images\/[^"]+)"/g)].map(m=>m[1]);
  for(const img of imgRefs)assert(fs.existsSync(path.join(dist,img.slice(1))),route+": missing image "+img);
  assert(/data-nav=/.test(html),route+": missing common navigation");
 }
 assert(paths.has("/work/")&&paths.has("/contact/")&&paths.has("/design-system/"),"Missing essential destination pages");
 for(const c of concepts)assert(paths.has(c.url),"Missing concept route "+c.url);
 for(const a of articles)assert(paths.has(a.url),"Missing article route "+a.url);
 assert(fs.existsSync(path.join(dist,"robots.txt"))&&fs.existsSync(path.join(dist,"sitemap.xml")),"Missing SEO files");
 console.log("Validated "+htmlFiles.length+" routes, shared navigation, local assets, anchors, semantic structure, and dependency-free scripts.");
})();
