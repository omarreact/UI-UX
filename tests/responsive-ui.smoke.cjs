// Browser smoke tests for all standalone showcase routes, at six responsive breakpoints.
(function smokeSite(){
 "use strict";
 const {chromium}=require("playwright");
 const {createSiteServer}=require("../scripts/dev-server.cjs");
 const sizes=[320,375,430,768,1024,1440];
 const destinations=["/","/services/","/work/","/about/","/process/","/insights/","/contact/","/design-system/"];
 const assert=(state,message)=>{if(!state)throw Error(message)};
 (async()=>{
  const server=createSiteServer();
  await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve)});
  const base="http://127.0.0.1:"+server.address().port;
  const browser=await chromium.launch({headless:true});
  let checks=0;
  try{
   for(const width of sizes){
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,isMobile:width<=600,hasTouch:width<=600,reducedMotion:"reduce"});
    const pageErrors=[];
    page.on("pageerror",error=>pageErrors.push(error.message));
    try{
     for(const route of destinations){
      const response=await page.goto(base+route,{waitUntil:"load"});
      assert(response.status()===200,route+" returned HTTP "+response.status());
      const d=await page.evaluate(()=>{
       const ids=[...document.querySelectorAll("[id]")].map(x=>x.id);
       const vw=document.documentElement.clientWidth;
       const offenders=[...document.querySelectorAll("body *")].map(el=>({el,rect:el.getBoundingClientRect()})).filter(x=>x.rect.width>0&&(x.rect.right>vw+1||x.rect.left < -1)).sort((a,b)=>b.rect.right-a.rect.right).slice(0,5).map(x=>({tag:x.el.tagName,cls:String(x.el.className||"").slice(0,70),text:x.el.textContent?.trim().slice(0,30),left:Math.round(x.rect.left),right:Math.round(x.rect.right)}));
       return {viewport:vw,scrollWidth:document.documentElement.scrollWidth,offenders,h1:document.querySelectorAll("h1").length,nav:!!document.querySelector("nav[aria-label]"),main:!!document.querySelector("main"),footer:!!document.querySelector("footer"),duplicateIds:ids.length!==new Set(ids).size};
      });
      assert(d.scrollWidth<=d.viewport+1,route+" overflow at "+width+"px: "+d.scrollWidth+" > "+d.viewport+" culprits="+JSON.stringify(d.offenders));
      assert(d.h1===1&&d.nav&&d.main&&d.footer&&!d.duplicateIds,route+" missing shared semantic layout");
      if(width<=900){
       const menu=page.locator(".mobile-toggle");
       assert(await menu.evaluate(el=>el.getBoundingClientRect().height)>=44,"Mobile menu target too small");
       assert(!(await page.locator("nav > .nav-cta").isVisible()),"Duplicate desktop CTA visible on mobile");
       await menu.click();
       assert(await menu.getAttribute("aria-expanded")==="true","Menu did not expand on "+route);
       assert(await page.locator(".nav-mobile-cta").isVisible(),"Missing mobile project action");
       await menu.click();
       assert(await menu.getAttribute("aria-expanded")==="false","Menu did not close on "+route);
      }else {
       const nav=page.locator(".nav-links a").first();
       const style=await nav.evaluate(el=>({decoration:getComputedStyle(el).textDecorationLine,color:getComputedStyle(el).color}));
       assert(style.decoration==="none"&&style.color!=="rgb(0, 0, 238)","Browser-default link styling detected on "+route);
      }
      if(route==="/services/"){
        const hero=page.locator(".services-showcase-hero");
        assert(await hero.count()===1, "Services page should have its own hero composition");
        assert(await page.locator(".services-showcase-message h1").count()===1,
          "Services editorial headline is missing");
        const categories=page.locator(".services-board-list a");
        assert(await categories.count()===6, "The six capability links are missing");
        const state=await page.evaluate(()=>{
          const links=[...document.querySelectorAll(".services-board-list a")];
          const hero=document.querySelector(".services-showcase-hero");
          return {
            display:getComputedStyle(hero).display,
            columns:getComputedStyle(hero).gridTemplateColumns,
            validLinks:links.every(a=>a.getAttribute("href")?.startsWith("#") &&
              document.getElementById(a.getAttribute("href").slice(1))),
            genericCircle:getComputedStyle(document.querySelector(".hero.hero-inner"),"::after").display
          };
        });
        assert(state.validLinks, "Services capability anchors do not resolve");
        assert(state.genericCircle==="none", "Old generic hero circles still visible");
        assert(state.display===(width<=760?"flex":"grid"), "Services hero did not respond to viewport");
        assert(await page.locator(".services-showcase-primary").getAttribute("href")==="#service-overview",
          "Services main CTA does not target service cards");
      }
      if(route==="/work/" && (width===375||width===1440)){
       const chips=page.locator("[data-filter]");
       await chips.filter({hasText:"Brand & Editorial"}).click();
       assert(await page.locator(".showcase-card:visible").count()===2,"Concept filter count wrong");
       await chips.first().click();
       assert(await page.locator(".showcase-card:visible").count()===6,"All concepts filter wrong");
      }
      if(route==="/insights/" && (width===375||width===1440)){
       await page.locator("[data-article-search]").fill("automation");
       assert(await page.locator(".article-card:visible").count()===1,"Insight search count wrong");
       await page.locator("[data-article-search]").fill("no-matching-concept-1346");
       assert(await page.locator("[data-article-empty]").isVisible(),"Missing search empty state");
      }
      if(route==="/contact/" && (width===375||width===1440)){
       const form=page.locator("#project-form");
       assert(!(await form.evaluate(el=>el.checkValidity())),"Empty contact form incorrectly valid");
       await page.locator("#client-name").fill("Showcase visitor");
       await page.locator("#client-email").fill("demo@example.com");
       await page.locator("#project-service").selectOption("Custom Design Concept");
       await page.locator("#project-message").fill("I would like to discuss a custom design concept for a future website.");
       assert(await form.evaluate(el=>el.checkValidity()),"Completed form incorrectly invalid");
       await page.locator("[data-copy-inquiry]").click();
       await page.waitForFunction(() => (document.querySelector("#form-feedback")?.textContent || "").length > 15);
       assert((await page.locator("#form-feedback").innerText()).length>15,"No contact form feedback");
      }
      if(route==="/process/" && (width===375||width===1440)){
       const faq=page.locator(".acc-btn");
       await faq.nth(1).click();
       assert(await faq.nth(1).getAttribute("aria-expanded")==="true","FAQ failed to open");
       assert(await faq.nth(0).getAttribute("aria-expanded")==="false","FAQ failed to close previous");
      }
      if(route==="/design-system/" && width===375){
       await page.locator("[data-copy-color]").first().click();
       await page.waitForFunction(() => (document.querySelector("[data-color-status]")?.textContent || "").includes("#"));
       assert((await page.locator("[data-color-status]").innerText()).includes("#"),"Color copy feedback missing");
      }
      checks++;
     }
     if(width===375||width===1440){
      for(const route of ["/work/novahire/","/work/retailsense/","/work/finvision/","/work/atelier/","/work/northstar/","/work/fieldnotes/","/insights/brand-led-growth/","/insights/digital-experience/","/insights/automation-with-intent/"]){
       const r=await page.goto(base+route,{waitUntil:"load"});
       assert(r.status()===200,route+" does not load");
       const dims=await page.evaluate(()=>({cw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth,title:document.querySelectorAll("h1").length}));
       assert(dims.sw<=dims.cw+1&&dims.title===1,"Detail page layout problem on "+route+" at "+width);
       checks++;
      }
     }
     assert(pageErrors.length===0,"Runtime errors at "+width+": "+pageErrors.join("; "));
     console.log("PASS "+width+"px: routes, navigation and interactive components");
    }finally{await page.close()}
   }
   const response=await fetch(base+"/does-not-exist/");
   assert(response.status===404,"Missing 404 fallback");
   console.log("PASS "+checks+" page/viewport combinations plus 404 fallback");
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
 })().catch(error=>{console.error(error);process.exitCode=1});
})();
