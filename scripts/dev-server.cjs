// Minimal zero-dependency HTTP preview for built HTML routes.
(function devServerModule(){
  "use strict";
  const http=require("node:http"),fs=require("node:fs"),path=require("node:path");
  const dist=path.resolve(__dirname,"..","dist");
  const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".webp":"image/webp",".txt":"text/plain; charset=utf-8",".xml":"application/xml; charset=utf-8"};
  function createSiteServer(){
    return http.createServer((request,response)=>{
      let pathname="/";
      try {pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname);}
      catch {response.writeHead(400);response.end("Bad request");return;}
      if(!["GET","HEAD"].includes(request.method)){response.writeHead(405,{Allow:"GET, HEAD"});response.end();return;}
      if(pathname.endsWith("/"))pathname+="index.html";
      if(!path.extname(pathname))pathname+="/index.html";
      const requested=path.resolve(dist,"."+pathname);
      if(!requested.startsWith(dist+path.sep)){response.writeHead(403);response.end("Forbidden");return;}
      const present=fs.existsSync(requested)&&fs.statSync(requested).isFile();
      const file=present?requested:path.join(dist,"404.html");
      const code=present?200:404;
      const ext=path.extname(file);
      response.writeHead(code,{"Content-Type":types[ext]||"application/octet-stream","X-Content-Type-Options":"nosniff","Cache-Control":"no-store"});
      if(request.method==="HEAD"){response.end();return;}
      fs.createReadStream(file).pipe(response);
    });
  }
  module.exports={createSiteServer};
  if(require.main===module){
    const port=Number(process.env.PORT)||4173;
    createSiteServer().listen(port,"127.0.0.1",()=>console.log("Independent showcase preview: http://127.0.0.1:"+port));
  }
})();
