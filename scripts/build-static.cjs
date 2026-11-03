// Native dependency-free site generator. Shared components and original structured content.
(function buildSite(){
  "use strict";
  const fs=require("node:fs"),path=require("node:path");
  const root=path.resolve(__dirname,".."),dist=path.join(root,"dist");
  const read=p=>fs.readFileSync(path.join(root,p),"utf8");
  const make=p=>fs.mkdirSync(p,{recursive:true});
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  fs.rmSync(dist,{recursive:true,force:true});
  for(const folder of ["assets/images","assets/css","assets/js","assets/brand"])make(path.join(dist,folder));
  // Logo masters and brand standards live in this repository, never a CDN.
  const brandFiles=["mark.svg","symbol-white.svg","logo-on-dark.svg",
    "logo-on-light.svg","social-card.svg","app-icon.svg",
    "pattern-tile.svg","tokens.json","BRAND-GUIDELINES.md"];
  const rasterFiles=["social-card.png","icon-192.png","icon-512.png","apple-touch-icon.png"];
  for(const name of brandFiles) {
    fs.copyFileSync(path.join(root,"src/brand",name),path.join(dist,"assets/brand",name));
  }
  for(const name of rasterFiles) {
    const source=path.join(root,"assets/brand",name);
    if(!fs.existsSync(source))throw Error("Missing first-party PNG brand export: "+name);
    fs.copyFileSync(source,path.join(dist,"assets/brand",name));
  }
  const images=fs.readdirSync(path.join(root,"assets/images")).filter(x=>x.endsWith(".webp"));
  if(images.length!==13)throw Error("Expected 13 WebP photographs, found "+images.length);
  for(const image of images)fs.copyFileSync(path.join(root,"assets/images",image),path.join(dist,"assets/images",image));
  for(const [source,target] of [["src/styles/site.css","assets/css/site.css"],["src/styles/pages.css","assets/css/pages.css"],["src/styles/brand.css","assets/css/brand.css"],["src/scripts/site.js","assets/js/site.js"],["src/scripts/router.js","assets/js/router.js"]])fs.copyFileSync(path.join(root,source),path.join(dist,target));
  const layout=read("src/layout.html"),nav=read("src/partials/nav.html"),footer=read("src/partials/footer.html"),cta=read("src/partials/cta.html");
  const editorialTemplate=read("src/partials/hero-editorial.html"),heroPanels=JSON.parse(read("src/content/hero-panels.json"));
  const concepts=JSON.parse(read("src/content/concepts.json")),articles=JSON.parse(read("src/content/articles.json"));
  const conceptCards=concepts.map(x=>'<article class="showcase-card" data-category="'+esc(x.category)+'"><a class="showcase-image" href="'+esc(x.url)+'" aria-label="Explore '+esc(x.name)+' concept"><img loading="lazy" decoding="async" src="/assets/images/'+esc(x.image)+'" alt="Visual inspiration for the '+esc(x.name)+' concept"></a><div class="showcase-body"><span>'+esc(x.eyebrow)+'</span><h3><a href="'+esc(x.url)+'">'+esc(x.name)+'</a></h3><p>'+esc(x.description)+'</p><a href="'+esc(x.url)+'" class="mini-btn">Explore concept ↗</a></div></article>').join("\n");
  const articleCards=articles.map(x=>'<article class="showcase-card article-card" data-search-text="'+esc([x.title,x.category,x.summary].join(" ").toLowerCase())+'"><a class="showcase-image" href="'+esc(x.url)+'" aria-label="Read '+esc(x.title)+'"><img loading="lazy" decoding="async" src="/assets/images/'+esc(x.image)+'" alt="Editorial visual for '+esc(x.title)+'"></a><div class="showcase-body"><span>'+esc(x.category)+' · '+esc(x.readingTime)+'</span><h3><a href="'+esc(x.url)+'">'+esc(x.title)+'</a></h3><p>'+esc(x.summary)+'</p><a class="mini-btn" href="'+esc(x.url)+'">Read article ↗</a></div></article>').join("\n");
  const configs=[
    ["home","/","Softly Solutions — Smarter Digital. Stronger Brands.","Independent creative studio design showcase with original digital concepts, editorial stories, and reusable visual systems."],
    ["services","/services/","Services — Softly Solutions","Discover brand strategy, digital design, development, workflows, and experience optimization.","Design that<br><em>works harder.</em>","Services / Capabilities","Connected thinking from first idea to a memorable digital experience."],
    ["work","/work/","Concepts — Softly Solutions","Explore six original and illustrative product, commerce, editorial, and brand design concepts.","Ideas made<br><em>visible.</em>","Showcase / Concepts","Original ideas with clear intent, not commissioned client case studies."],
    ["about","/about/","The Studio — Softly Solutions","Discover the independent visual design philosophy behind Softly Solutions.","Creative thinking.<br><em>Clear intention.</em>","Studio / About","A thoughtful visual identity that travels consistently across the entire website."],
    ["process","/process/","Process — Softly Solutions","Follow a practical six-step design and development workflow.","From question<br><em>to clarity.</em>","Approach / Process","A transparent process centered on user needs and deliberate choices."],
    ["insights","/insights/","Insights — Softly Solutions","Original notes on brand-led growth, better digital experiences, and thoughtful automation.","Ideas worth<br><em>reading.</em>","Journal / Insights","Thoughtful writing for building clearer digital experiences."],
    ["contact","/contact/","Contact — Softly Solutions","Prepare a design inquiry and contact the studio showcase team.","Let's make<br><em>something matter.</em>","Contact / Start a Project","Share your idea, the audience you serve, and the outcome that matters."],
    ["design-system","/design-system/","Design System — Softly Solutions","Explore the palette, typography, interface components, and reusable design patterns.","One system.<br><em>Many expressions.</em>","Showcase / Design System","Explore the components and decisions behind the complete visual language."],
    ["brand","/brand/","Brand Guide — Softly Solutions","Discover the original Softly logo, brand standards, voice, palette, and downloadable identity assets.","Ideas with<br><em>intention.</em>","Showcase / Brand Guide","A complete independent identity, built with a warm visual language."]
  ].map(x=>({id:x[0],route:x[1],title:x[2],description:x[3],heroTitle:x[4],heroLabel:x[5],heroText:x[6],source:x[0]}));
  for(const x of concepts)configs.push({id:"work",route:x.url,title:x.name+" Concept — Softly Solutions",description:x.description,heroTitle:esc(x.name)+"<br><em>"+esc(x.subtitle)+"</em>",heroLabel:esc(x.eyebrow),heroText:"An original illustrative concept exploring a particular design challenge.",body:
    '<section class="page-section"><div class="wrap"><div class="reading-meta"><span>Illustrative concept</span><span>'+esc(x.category)+'</span></div><div class="detail-layout"><div class="detail-main"><img class="detail-image" src="/assets/images/'+esc(x.image)+'" alt="Visual inspiration for '+esc(x.name)+'" decoding="async"><span class="eyebrow-detail">The idea</span><h2>'+esc(x.subtitle)+'</h2><p class="article-intro">'+esc(x.description)+'</p><h2 id="concept-challenge">The challenge</h2><p>'+esc(x.challenge)+'</p><h2 id="concept-approach">The design approach</h2><p>'+esc(x.solution)+'</p><h2 id="concept-highlights">Experience highlights</h2><div class="detail-feature-grid">'+x.features.map((t,i)=>'<div class="detail-feature"><strong>0'+(i+1)+'</strong>'+esc(t)+'</div>').join("")+'</div><div class="aside-note"><strong>Independent concept</strong><span>This is a design exploration, not a commissioned project or verified business result.</span></div><div class="related-links"><a class="light-btn" href="/work/">← All concepts</a><a class="orange-btn" href="/contact/?service=Custom%20Design%20Concept">Request a similar direction ↗</a></div></div><aside class="detail-aside"><span>Concept overview</span><h3>'+esc(x.name)+'</h3><p>Designed for '+esc(x.audience)+'.</p><a class="orange-btn" href="/contact/?service=Custom%20Design%20Concept">Discuss this concept</a></aside></div></div></section>{{CTA}}'
  });
  for(const x of articles)configs.push({id:"insights",route:x.url,title:x.title+" — Softly Solutions",description:x.summary,heroTitle:esc(x.title),heroLabel:esc(x.category)+" / Insights",heroText:"An original editorial note on digital design and modern product thinking.",body:
    '<article class="page-section article-detail"><div class="wrap"><div class="reading-meta"><span>'+esc(x.category)+'</span><span>'+esc(x.readingTime)+'</span><span>Original studio note</span></div><div class="detail-layout"><div class="detail-main"><img class="detail-image" src="/assets/images/'+esc(x.image)+'" alt="Editorial visual" decoding="async"><p class="article-intro">'+esc(x.summary)+'</p>'+x.sections.map((s,i)=>'<section id="reading-section-'+(i+1)+'"><h2>'+esc(s.heading)+'</h2>'+s.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join("")+'</section>').join("")+'<div class="related-links"><a class="light-btn" href="/insights/">← All insights</a><a class="orange-btn" href="/contact/">Start a conversation ↗</a></div></div><aside class="detail-aside"><span>Reading note</span><h3>A moment for reflection</h3><p>Original editorial content for this independent, reusable design showcase.</p><a class="mini-btn" href="/design-system/">Explore our design system ↗</a></aside></div></div></article>{{CTA}}'
  });
  configs.push({id:"not-found",route:"/404.html",title:"Page not found — Softly Solutions",description:"Return to the Softly Solutions design showcase.",heroTitle:"Lost your way?<br><em>We've got you.</em>",heroLabel:"404 / Not found",heroText:"The link may have moved, but there is still plenty to discover.",body:'<section class="page-section"><div class="wrap center-head"><h2 class="section-title">More to explore.</h2><p>This page does not exist. Our services, concepts, and stories are one click away.</p><div class="cta-actions"><a class="orange-btn" href="/">Back home</a><a class="light-btn" href="/work/">Explore concepts</a></div></div></section>'});

  // One reusable editorial hero for every inner page except Services, which
  // retains its approved original, and Home, which stays completely untouched.
  const renderEditorialHero=p=>{
    let panel;
    let links;
    let kind="page";
    if(p.route.startsWith("/work/")&&p.route!=="/work/"){
      const concept=concepts.find(x=>x.url===p.route);
      if(!concept)throw Error("Missing concept data for "+p.route);
      kind="detail";
      panel={
        edition:"THE CONCEPT FILE",kicker:concept.eyebrow,
        title:esc(concept.name)+"<br><em>in focus.</em>",
        description:concept.description,
        boardLabel:"THE IDEA / THE APPROACH",
        boardTitle:"Inside the<br><em>concept.</em>",
        primaryHref:"#concept-challenge",primaryLabel:"Explore the concept",
        secondaryHref:"/work/",secondaryLabel:"All concepts",
        footnote:"INDEPENDENT / ILLUSTRATIVE DESIGN",
      };
      links=[["#concept-challenge","The challenge"],["#concept-approach","The design approach"],
        ["#concept-highlights","Experience highlights"],["/contact/?service=Custom%20Design%20Concept","Discuss this direction"]];
    }else if(p.route.startsWith("/insights/")&&p.route!=="/insights/"){
      const article=articles.find(x=>x.url===p.route);
      if(!article)throw Error("Missing article data for "+p.route);
      kind="article";
      panel={
        edition:"THE READING ROOM",kicker:article.category+" / "+article.readingTime,
        title:esc(article.title),description:article.summary,
        boardLabel:"IN THIS ARTICLE",boardTitle:"The ideas<br><em>inside.</em>",
        primaryHref:"#reading-section-1",primaryLabel:"Start reading",
        secondaryHref:"/insights/",secondaryLabel:"All journal notes",
        footnote:"ORIGINAL EDITORIAL / "+article.readingTime.toUpperCase()
      };
      links=article.sections.map((section,i)=>["#reading-section-"+(i+1),section.heading]);
      links.push(["/insights/","Back to the journal"]);
    }else{
      panel=heroPanels[p.id];
      if(!panel)throw Error("Missing editorial hero configuration for "+p.id);
      links=panel.links==="concepts"?concepts.map(x=>[x.url,x.name]):
        panel.links==="articles"?articles.map(x=>[x.url,x.title]):panel.links;
    }
    if(!Array.isArray(links)||!links.length||links.length>8)throw Error("Invalid hero navigation for "+p.route);
    const content={
      EDITION_LABEL:esc(panel.edition),
      KICKER:esc(panel.kicker),
      TITLE:panel.title,
      DESCRIPTION:esc(panel.description),
      PRIMARY_URL:esc(panel.primaryHref),
      PRIMARY_LABEL:esc(panel.primaryLabel),
      SECONDARY_URL:esc(panel.secondaryHref),
      SECONDARY_LABEL:esc(panel.secondaryLabel),
      BOARD_LABEL:esc(panel.boardLabel),
      BOARD_TITLE:panel.boardTitle,
      FOOTNOTE:esc(panel.footnote),
      KIND:esc(kind),
      NAV_LABEL:esc(panel.boardLabel.toLowerCase()+" navigation"),
      BOARD_ITEMS:links.map(([url,label],i)=>
        '<li><a href="'+esc(url)+'"><span class="services-board-number">'+
        String(i+1).padStart(2,"0")+'</span><span>'+esc(label)+
        '</span><span class="services-board-arrow" aria-hidden="true">↗</span></a></li>'
      ).join("")
    };
    const result=editorialTemplate.replace(/\{\{([A-Z_]+)\}\}/g,(match,key)=>{
      if(!(key in content))throw Error("Unknown editorial hero key "+key);
      return content[key];
    });
    if(/\{\{[^}]+\}\}/.test(result))throw Error("Unresolved hero variables on "+p.route);
    return result;
  };

  for(const p of configs){
    let body=p.body||read("src/pages/"+p.source+".html");
    body=body.replaceAll("{{CONCEPT_GRID}}",conceptCards).replaceAll("{{ARTICLE_GRID}}",articleCards).replaceAll("{{CTA}}",cta);
    if(p.id==="home")body=body.replace(/href="#contact"/g,'href="/contact/"').replace(/href="#work"/g,'href="/work/"');
        const hero=p.id==="home"?read("src/partials/hero-home.html"):p.id==="services"?read("src/partials/hero-services.html"):renderEditorialHero(p);
    let navbar=nav.replace('data-nav="'+p.id+'"','data-nav="'+p.id+'" aria-current="page"');
    let html=layout;
    const params={"{{TITLE}}":esc(p.title),"{{DESCRIPTION}}":esc(p.description),"{{CANONICAL}}":"https://agency.pincodeit.com"+p.route,"{{PAGE_ID}}":p.id,"{{HERO_CLASS}}":p.id==="home"?"":p.id==="services"?"hero-inner":"hero-inner hero-editorial","{{NAV}}":navbar,"{{HERO}}":hero,"{{BODY}}":body,"{{FOOTER}}":footer};
    for(const [key,value] of Object.entries(params))html=html.replaceAll(key,()=>value);
    if(/\{\{[^}]+\}\}/.test(html))throw Error("Unresolved layout variable in "+p.route);
    const target=p.route==="/"?path.join(dist,"index.html"):p.route==="/404.html"?path.join(dist,"404.html"):path.join(dist,p.route.slice(1),"index.html");
    make(path.dirname(target));fs.writeFileSync(target,html);
  }
  fs.writeFileSync(path.join(dist,"manifest.webmanifest"),JSON.stringify({
    name:"Softly Solutions — Design Showcase",
    short_name:"Softly",description:"Ideas with intention. A distinctive design showcase.",
    start_url:"/",scope:"/",display:"standalone",
    background_color:"#F4F1EC",theme_color:"#120807",
    icons:[{src:"/assets/brand/icon-192.png",sizes:"192x192",type:"image/png"},
           {src:"/assets/brand/icon-512.png",sizes:"512x512",type:"image/png"}]
  },null,2)+"\n");
  require("./package-brand.cjs");
  fs.writeFileSync(path.join(dist,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: https://agency.pincodeit.com/sitemap.xml\n");
  fs.writeFileSync(path.join(dist,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+configs.filter(x=>x.id!=="not-found").map(x=>'<url><loc>https://agency.pincodeit.com'+x.route+'</loc></url>').join("")+'</urlset>');
  fs.writeFileSync(path.join(dist,"_headers"),["/*","  X-Content-Type-Options: nosniff","  Referrer-Policy: strict-origin-when-cross-origin","  X-Frame-Options: DENY","","/assets/css/*","  Cache-Control: public, max-age=300","","/assets/js/*","  Cache-Control: public, max-age=300","","/assets/images/*","  Cache-Control: public, max-age=86400","","/assets/brand/*","  Cache-Control: public, max-age=86400",""].join("\n"));
  console.log("Built "+configs.length+" routes and "+images.length+" original first-party assets.");
})();
