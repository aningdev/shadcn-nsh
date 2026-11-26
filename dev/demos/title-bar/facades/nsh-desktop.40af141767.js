const host=globalThis.__nsh_browser_realm.modules;
let e0=host.get("nsh/desktop")["currentWindow"];export{e0 as "currentWindow"};
let e1=host.get("nsh/desktop")["isAvailable"];export{e1 as "isAvailable"};
let e2=host.get("nsh/desktop")["titleBar"];export{e2 as "titleBar"};
globalThis.__nsh_browser_realm.watch(()=>{e0=host.get("nsh/desktop")["currentWindow"];e1=host.get("nsh/desktop")["isAvailable"];e2=host.get("nsh/desktop")["titleBar"];});
