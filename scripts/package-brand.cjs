// Minimal, dependency-free ZIP archive writer for the public brand kit.
// ZIP32 store-only entries: easy to inspect and extract on any OS.
(function brandPackage(){
  "use strict";
  const fs=require("node:fs"),path=require("node:path");
  const root=path.resolve(__dirname,"..");
  const output=path.join(root,"dist/assets/brand/softly-brand-kit.zip");
  const source=path.join(root,"dist/assets/brand");
  const names=[
    "mark.svg","symbol-white.svg","logo-on-light.svg","logo-on-dark.svg",
    "social-card.svg","social-card.png","icon-192.png","icon-512.png",
    "apple-touch-icon.png","pattern-tile.svg","tokens.json","BRAND-GUIDELINES.md"
  ];
  const table=Array.from({length:256},(_,n)=>{
    let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;
    return c>>>0;
  });
  const crc32=bytes=>{
    let crc=0xffffffff;
    for(const byte of bytes)crc=table[(crc^byte)&255]^(crc>>>8);
    return (crc^0xffffffff)>>>0;
  };
  const local=[],central=[];
  let offset=0;
  for(const name of names){
    const file=path.join(source,name);
    if(!fs.existsSync(file))throw Error("Missing brand kit file "+name);
    const bytes=fs.readFileSync(file),label=Buffer.from(name,"utf8"),crc=crc32(bytes);
    const h=Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);
    h.writeUInt32LE(crc,14);h.writeUInt32LE(bytes.length,18);
    h.writeUInt32LE(bytes.length,22);h.writeUInt16LE(label.length,26);
    local.push(h,label,bytes);
    const dir=Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50,0);dir.writeUInt16LE(20,4);
    dir.writeUInt16LE(20,6);dir.writeUInt32LE(crc,16);
    dir.writeUInt32LE(bytes.length,20);dir.writeUInt32LE(bytes.length,24);
    dir.writeUInt16LE(label.length,28);dir.writeUInt32LE(offset,42);
    central.push(dir,label);
    offset+=h.length+label.length+bytes.length;
  }
  const middle=Buffer.concat(central),end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);
  end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);
  end.writeUInt32LE(middle.length,12);end.writeUInt32LE(offset,16);
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,Buffer.concat([...local,middle,end]));
  console.log("Packaged "+names.length+" first-party brand assets ("+fs.statSync(output).size+" bytes).");
})();
