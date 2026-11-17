(function(){
const EV = {onclick:'onClick',onchange:'onChange',onkeydown:'onKeyDown',onpointerdown:'onPointerDown',onpointermove:'onPointerMove',onpointerup:'onPointerUp',onpointercancel:'onPointerCancel',oninput:'onInput'};
function look(scope, path){ path=path.trim(); if(path==='true')return true; if(path==='false')return false; if(/^-?\d+(\.\d+)?$/.test(path))return +path;
  let v=scope; for(const k of path.split('.')){ if(v==null) return undefined; v=v[k]; } return v; }
const WHOLE=/^\{\{([^}]*)\}\}$/;
function interp(str, scope){ const m=str.match(WHOLE); if(m) return look(scope,m[1]); return str.replace(/\{\{([^}]*)\}\}/g,(_,p)=>{const v=look(scope,p);return v==null?'':String(v);}); }
function styleObj(s){ const o={}; s.split(';').forEach(d=>{ const i=d.indexOf(':'); if(i<0)return; let k=d.slice(0,i).trim(), v=d.slice(i+1).trim(); if(!k)return; if(!k.startsWith('--')) k=k.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()); o[k]=v; }); return o; }
function conv(node, scope, key){
  const h=React.createElement;
  if(node.nodeType===3){ const t=node.nodeValue; if(!t.includes('{{')) return t; const m=t.trim().match(WHOLE); if(m && t.trim()===t) { const v=look(scope,m[1]); return v==null?'':(typeof v==='object'?'':v); } return interp(t,scope); }
  if(node.nodeType!==1) return null;
  const tag=node.tagName.toLowerCase();
  const kids=n=>Array.from(n.childNodes).map((c,i)=>conv(c,scope,i));
  if(tag==='sc-if'){ return look(scope,(node.getAttribute('value')||'').replace(/[{}]/g,'')) ? h(React.Fragment,{key},...kids(node)) : null; }
  if(tag==='sc-for'){ const list=look(scope,(node.getAttribute('list')||'').replace(/[{}]/g,''))||[]; const as=node.getAttribute('as');
    return h(React.Fragment,{key}, list.map((it,i)=>h(React.Fragment,{key:i},...Array.from(node.childNodes).map((c,j)=>conv(c,Object.assign({},scope,{[as]:it,$index:i}),j))))); }
  if(tag==='helmet') return null;
  const props={key};
  for(const a of Array.from(node.attributes)){
    let n=a.name, v=a.value; if(n.startsWith('hint-')) continue;
    const val=interp(v,scope);
    if(n==='class') props.className=val; else if(n==='for') props.htmlFor=val; else if(n==='style') props.style=styleObj(String(val));
    else if(EV[n]) props[EV[n]]=val; else if(n==='ref') props.ref=val; else if(n==='tabindex') props.tabIndex=val;
    else if(n==='value' && (tag==='input'||tag==='textarea')) { props.value=val==null?'':val; }
    else props[n]= (typeof val==='boolean' && n.startsWith('aria-')) ? String(val) : val;
  }
  if((tag==='input'||tag==='textarea') && 'value' in props && !props.onChange) props.readOnly=true;
  const ch=kids(node);
  if(tag==='textarea') return h(tag,props);
  return h(tag, props, ...(ch.length?ch:[]));
}
window.DCLogic = class extends React.Component { render(){ const vals=this.renderVals(); return conv(window.__TPL, vals, 'root'); } };
window.__mount = function(){ const root=ReactDOM.createRoot(document.getElementById('app')); root.render(React.createElement(window.Component, window.__PROPS||{})); };
})();
