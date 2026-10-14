// @ts-nocheck — pose data and SVG drawing ported verbatim from the prototype (move-figures.js).
/* ---------- Move illustrations: 3 frames per move, drawn from joint angles ----------
   Angles in degrees: 0 = right, 90 = down, 180 = left, -90 = up. Frame is 120 x 110, floor at y 104.
   h = hip point, t = torso angle (hip to shoulder), hd/hl = head direction/length, a = [near arm, far arm] [upper, fore],
   l = [near leg, far leg] [thigh, shin], bend = torso curve, sh = shoulder lift, fd = foot angle, p = props, m = markers */
export const FIG: { M: Record<string, unknown[]>; frame: (p: unknown, name?: string) => string; has: (n: string) => boolean } =(()=>{
  const R=Math.PI/180,dv=(a,l)=>[Math.cos(a*R)*l,Math.sin(a*R)*l],ad=(p,v)=>[p[0]+v[0],p[1]+v[1]],f=n=>Math.round(n*10)/10;
  const st=(o={})=>({h:[60,65],t:-90,a:[[96,92],[84,88]],l:[[93,90],[87,90]],...o});
  const sit=(o={})=>({h:[48,83],t:-90,a:[[80,30],[86,34]],l:[[0,90],[-4,92]],p:['chair'],...o});
  const back=(o={})=>({h:[64,98],t:180,a:[[2,0],[6,0]],l:[[-50,60],[-46,62]],fd:-60,p:['mat'],...o});
  const fours=(o={})=>({h:[50,84],t:-21,hd:-12,a:[[90,90],[87,90]],l:[[90,180],[87,180]],fd:180,p:['mat'],...o});
  const side=(o={})=>({h:[64,97],t:180,a:[[10,-10],[30,0]],l:[[10,175],[14,178]],fd:180,p:['mat'],...o});
  const kneel=(o={})=>({h:[40,94],t:-90,a:[[60,20],[66,24]],l:[[27,180],[27,180]],fd:180,p:['mat'],...o});
  const bridge=(o={})=>back({h:[62,84],t:152,hd:180,l:[[0,88],[4,90]],...o});
  const lunge=(o={})=>({h:[56,85],t:-88,a:[[60,10],[64,14]],l:[[0,90],[110,180]],p:['mat'],...o});
  const walkA=(o={})=>st({l:[[70,95],[110,90]],a:[[110,95],[70,80]],...o}), walkB=(o={})=>st({l:[[110,90],[70,95]],a:[[70,80],[110,95]],...o});
  const wallLean=(o={})=>({h:[56,66],t:-70,a:[[-8,-8],[-5,-6]],l:[[100,102],[95,100]],p:['wall'],...o});
  const hinge=(o={})=>({h:[52,66],t:-40,hd:-30,a:[[90,90],[86,90]],l:[[96,86],[86,92]],p:['bottles'],...o});
  const onToes={h:[60,57],fd:72};
  const bench=(o={})=>st({a:[[30,10],[26,12]],p:['bench'],...o});
  const M={
   'Shoulder rolls':[st({m:[['rot',44,32]]}),st({sh:-4,m:[['up',76,24]]}),st({sh:1,a:[[100,98],[80,82]],m:[['rot',44,32]]})],
   'Neck half-circles':[st({hd:-42,m:[['rot',84,14]]}),st({hd:-90,hl:8,m:[['down',76,18]]}),st({hd:-138})],
   'Cat and cow':[fours(),fours({bend:8,hd:55,m:[['up',60,56]]}),fours({bend:-6,hd:-45,m:[['down',60,84]]})],
   'Side reach':[st(),st({t:-80,a:[[96,92],[-105,-55]]}),st({t:-100,a:[[-75,-125],[84,88]]})],
   'Calf stretch':[wallLean({h:[62,65],t:-80,l:[[93,90],[87,90]]}),wallLean({h:[62,66],t:-72,l:[[76,96],[112,112]]}),wallLean({h:[62,66],t:-72,l:[[76,96],[112,112]],m:[['hold',36,92]]})],
   'Big breaths':[st(),st({a:[[3,0],[177,180]],m:[['pulse',60,46]]}),st({a:[[-75,-86],[-105,-94]]})],
   'Chin tucks':[sit({hd:-80}),sit({hd:-100,m:[['left',66,16]]}),sit({hd:-100,m:[['hold',72,24]]})],
   'Chest opener':[sit(),sit({a:[[118,100],[112,96]],t:-94}),sit({a:[[118,100],[112,96]],t:-94,hd:-100,m:[['hold',74,40]]})],
   'Wrist and hand circles':[sit({a:[[0,0],[5,0]]}),sit({a:[[0,-10],[5,-5]],m:[['rot',86,44]]}),sit({a:[[0,8],[5,6]],m:[['pulse',88,56]]})],
   'Seated hip stretch':[sit(),sit({l:[[-25,120],[-4,92]]}),sit({t:-70,hd:-60,l:[[-25,120],[-4,92]],a:[[60,30],[70,34]],m:[['hold',90,30]]})],
   'Stand and reach':[sit(),{h:[54,76],t:-60,a:[[-5,5],[-2,8]],l:[[25,98],[22,100]],p:['chair']},st({h:[58,65],a:[[-80,-90],[-100,-90]],p:['chair']})],
   'Look far away':[sit({p:['chair','window']}),sit({hd:-60,p:['chair','window']}),sit({hd:-60,p:['chair','window'],m:[['hold',68,18]]})],
   'Child\'s pose':[kneel(),kneel({t:-45,hd:-40,a:[[-15,0],[-12,2]]}),kneel({h:[38,95],t:5,hd:20,a:[[0,0],[-3,0]],m:[['hold',34,70]]})],
   'Supported bridge':[back(),bridge(),back({h:[64,92],t:170,hd:180,l:[[-40,65],[-36,67]],p:['mat','cushion'],m:[['hold',62,70]]})],
   'Reclined butterfly':[back(),back({l:[[-20,150],[-70,110]],fd:180}),back({l:[[-20,150],[-70,110]],fd:180,p:['mat','cushionK'],m:[['hold',80,66]]})],
   'Legs up the wall':[back({h:[94,98],l:[[-115,60],[-112,62]],p:['mat','wall']}),back({h:[94,98],l:[[-100,-70],[-98,-72]],fd:-90,p:['mat','wall']}),back({h:[94,98],l:[[-92,-90],[-90,-90]],fd:0,p:['mat','wall'],m:[['hold',60,70]]})],
   'Side-lying rest':[back(),side(),side({p:['mat','pillowK'],m:[['pulse',40,84]]})],
   'Mountain breath':[st(),st({a:[[3,0],[177,180]],m:[['pulse',60,46]]}),st({a:[[-75,-86],[-105,-94]]})],
   'Low lunge':[{h:[56,84],t:-90,a:[[96,92],[84,88]],l:[[100,180],[96,180]],fd:180,p:['mat']},lunge({t:-75,a:[[45,30],[50,34]]}),lunge({a:[[-80,-90],[-95,-90]],m:[['hold',96,30]]})],
   'Warrior two':[st({l:[[60,90],[120,90]]}),st({l:[[60,90],[120,90]],a:[[0,0],[180,180]]}),st({h:[58,72],l:[[30,90],[128,128]],a:[[0,0],[180,180]],m:[['hold',96,60]]})],
   'Tree pose':[st(),st({a:[[130,-20],[50,-160]],l:[[90,90],[120,30]]}),st({a:[[-80,-95],[-100,-85]],l:[[90,90],[120,30]],m:[['hold',94,40]]})],
   'Chair pose':[st(),{h:[52,74],t:-70,a:[[-20,-20],[-16,-18]],l:[[30,100],[34,102]]},{h:[52,74],t:-72,a:[[-62,-80],[-66,-82]],l:[[30,100],[34,102]],m:[['hold',94,50]]}],
   'Rest on your back':[back(),back({l:[[0,0],[3,0]],fd:-80,a:[[18,8],[10,4]]}),back({l:[[0,0],[3,0]],fd:-80,a:[[18,8],[10,4]],m:[['pulse',44,84]]})],
   'Breath and pelvic floor':[back({m:[['pulse',42,84]]}),back({m:[['up',62,84]]}),back({m:[['down',62,84]]})],
   'Pelvic tilts':[back(),back({bend:2.5,m:[['down',50,86]]}),back({bend:-3.5,m:[['up',50,86]]})],
   'Heel slides':[back(),back({l:[[-25,25],[-46,62]],fd:-40}),back({l:[[0,0],[-46,62]],fd:-80,m:[['right',104,90]]})],
   'Knee fall-outs':[back(),back({l:[[-38,85],[-46,62]],m:[['down',88,74]]}),back({m:[['up',88,74]]})],
   'Bridge':[back(),bridge({m:[['up',62,70]]}),bridge({m:[['hold',62,68]]})],
   'Clam shells':[side(),side({l:[[-25,142],[14,178]],m:[['up',86,78]]}),side()],
   'Bird dog':[fours(),fours({a:[[-8,-8],[87,90]],l:[[90,180],[178,180]]}),fours({a:[[-8,-8],[87,90]],l:[[90,180],[178,180]],m:[['hold',60,52]]})],
   'Dead bug':[back({a:[[-95,-90],[-88,-90]],l:[[-90,0],[-86,0]],fd:-90}),back({a:[[-95,-90],[-88,-90]],l:[[-40,50],[-86,0]],fd:-60}),back({a:[[-95,-90],[-88,-90]],l:[[-90,0],[-40,50]],fd:-60})],
   'Side-lying leg lifts':[side({l:[[0,0],[14,178]],fd:-80}),side({l:[[-18,-18],[14,178]],fd:-100,m:[['up',104,74]]}),side({l:[[0,0],[14,178]],fd:-80})],
   'Side plank on knees':[{h:[64,98],t:-162,hd:-170,a:[[90,180],[80,10]],l:[[15,200],[18,198]],fd:200,p:['mat']},{h:[64,88],t:182,hd:185,a:[[90,180],[30,-10]],l:[[42,200],[45,198]],fd:200,p:['mat'],m:[['up',64,72]]},{h:[64,88],t:182,hd:185,a:[[90,180],[-90,-90]],l:[[42,200],[45,198]],fd:200,p:['mat'],m:[['hold',90,72]]}],
   'Wall angels':[st({a:[[-10,-95],[190,-85]],p:['wallback']}),st({a:[[-60,-62],[-120,-118]],p:['wallback'],m:[['up',96,20]]}),st({a:[[-10,-95],[190,-85]],p:['wallback'],m:[['down',96,30]]})],
   'Tall standing':[st({t:-96,hd:-70,bend:3}),st(),st({m:[['up',76,8]]})],
   'Warm-up march':[st({l:[[20,95],[90,90]],a:[[60,20],[120,130]]}),st(),st({l:[[90,90],[20,95]],a:[[120,130],[60,20]]})],
   'Sit to stand':[sit(),{h:[54,76],t:-58,a:[[-10,0],[-6,4]],l:[[25,98],[22,100]],p:['chair']},st({h:[58,65],p:['chair']})],
   'Wall push-ups':[wallLean(),wallLean({t:-58,a:[[30,-45],[34,-42]]}),wallLean({m:[['right',36,40]]})],
   'Step-ups':[st({h:[55,65],p:['step']}),st({h:[55,65],l:[[20,80],[87,90]],p:['step']}),st({h:[80,51],a:[[96,92],[84,88]],l:[[90,90],[95,90]],p:['step']})],
   'Bent-over row':[hinge(),hinge({a:[[160,62],[156,66]],m:[['up',60,40]]}),hinge()],
   'Calf raises':[bench(),bench({...onToes,m:[['up',40,70]]}),bench({m:[['down',40,70]]})],
   'Heel drops':[st(onToes),st({m:[['thud',58,104]]}),st(onToes)],
   'Cool-down stretch':[wallLean({h:[62,66],t:-72,l:[[76,96],[112,112]]}),st({a:[[120,100],[116,96]],t:-94}),st({m:[['pulse',60,46]]})],
   'Squat to chair':[st({h:[56,65],p:['chair2']}),{h:[50,80],t:-60,a:[[-15,-5],[-12,-2]],l:[[15,100],[18,102]],p:['chair2']},{h:[48,83],t:-70,a:[[-15,-5],[-12,-2]],l:[[0,90],[-4,92]],p:['chair2'],m:[['up',30,50]]}],
   'Glute bridge':[back(),bridge({m:[['up',62,70]]}),bridge({m:[['hold',62,68]]})],
   'Shopping-bag carry':[walkA({a:[[80,86],[100,94]],p:['bags']}),walkB({a:[[80,86],[100,94]],p:['bags']}),walkA({a:[[80,86],[100,94]],p:['bags'],m:[['right',100,30]]})],
   'Bottle row':[st({a:[[0,0],[4,2]],p:['bottles']}),st({a:[[168,0],[172,2]],p:['bottles'],m:[['left',30,30]]}),st({a:[[0,0],[4,2]],p:['bottles']})],
   'Balance stand':[bench(),bench({l:[[90,90],[100,150]]}),st({l:[[90,90],[100,150]],a:[[60,30],[120,150]],p:['bench'],m:[['hold',30,30]]})],
   'Shake it out':[st({a:[[30,60],[150,120]],m:[['wiggle',90,52]]}),st({a:[[60,100],[120,80]],l:[[80,100],[90,90]],m:[['wiggle',30,52]]}),st({m:[['pulse',60,46]]})],
   'Easy warm-up':[walkA({l:[[80,95],[100,90]]}),walkB({l:[[100,90],[80,95]]}),walkA({l:[[80,95],[100,90]]})],
   'Brisk walk':[walkA({a:[[130,80],[50,20]]}),walkB({a:[[50,20],[130,80]]}),walkA({a:[[130,80],[50,20]],m:[['right',100,40]]})],
   'Easy cool-down':[walkA({l:[[82,95],[98,90]]}),walkB({l:[[98,90],[82,95]]}),st({m:[['pulse',60,46]]})],
   'Heel-to-toe stand':[bench(),bench({l:[[88,92],[94,88]],m:[['hold',30,30]]}),bench({l:[[88,92],[94,88]]})],
   'Single-leg stand':[bench(),bench({l:[[90,90],[110,160]]}),bench({l:[[90,90],[110,160]],m:[['hold',30,30]]})],
   'Heel-to-toe walk':[bench({l:[[84,94],[96,88]]}),bench({h:[66,65],l:[[96,88],[84,94]]}),bench({h:[72,65],l:[[84,94],[96,88]],m:[['right',40,90]]})],
   'Side steps':[st({l:[[90,90],[90,90]]}),st({l:[[60,90],[120,90]],m:[['right',100,96]]}),st({h:[70,65],l:[[90,90],[90,90]]})],
   'Slow sit to stand':[sit(),{h:[54,76],t:-58,a:[[-10,0],[-6,4]],l:[[25,98],[22,100]],p:['chair'],m:[['hold',90,30]]},st({h:[58,65],p:['chair']})]};
  function pts(p){const H=p.h;let S=ad(H,dv(p.t,30));if(p.sh)S=[S[0],S[1]+p.sh];const He=ad(S,dv(p.hd??p.t,p.hl??12));
    const arm=a=>{const e=ad(S,dv(a[0],16));return[e,ad(e,dv(a[1],15))]},leg=l=>{const k=ad(H,dv(l[0],20));return[k,ad(k,dv(l[1],19))]};
    return{H,S,He,A:p.a.map(arm),L:p.l.map(leg)}}
  const ln=(pts,w,c)=>`<path d="M${pts.map(q=>f(q[0])+' '+f(q[1])).join('L')}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const PROP={
    chair:'<path d="M34 58V104M64 92V104" stroke="var(--fig-prop)" stroke-width="3" stroke-linecap="round"/><rect x="32" y="87" width="36" height="5" rx="2.5" fill="var(--fig-prop)"/>',
    chair2:'<path d="M28 60V104M58 92V104" stroke="var(--fig-prop)" stroke-width="3" stroke-linecap="round"/><rect x="26" y="87" width="36" height="5" rx="2.5" fill="var(--fig-prop)"/>',
    wall:'<rect x="100" y="6" width="6" height="98" rx="2" fill="var(--fig-prop)"/>',
    wallback:'<rect x="34" y="4" width="52" height="100" rx="6" fill="var(--fig-prop)" opacity=".45"/>',
    mat:'<rect x="6" y="103" width="108" height="3" rx="1.5" fill="var(--fig-mat)"/>',
    step:'<rect x="68" y="90" width="40" height="14" rx="3" fill="var(--fig-prop)"/>',
    bench:'<path d="M84 44H114M88 44V104M110 44V104" stroke="var(--fig-prop)" stroke-width="3.5" stroke-linecap="round"/>',
    cushion:'<ellipse cx="62" cy="99" rx="11" ry="4.5" fill="var(--fig-mat)"/>',
    cushionK:'<ellipse cx="88" cy="96" rx="8" ry="4" fill="var(--fig-mat)"/>',
    pillowK:'<ellipse cx="80" cy="99" rx="6" ry="3.5" fill="var(--fig-mat)"/>',
    window:'<rect x="84" y="8" width="28" height="30" rx="3" fill="none" stroke="var(--fig-prop)" stroke-width="2.5"/><path d="M98 8V38M84 23H112" stroke="var(--fig-prop)" stroke-width="1.5"/><circle cx="106" cy="15" r="3" fill="var(--mm-gold)" opacity=".7"/>'};
  const MK={
    up:(x,y)=>`<path d="M${x} ${y+6}V${y-5}M${x-4} ${y-1}L${x} ${y-5}L${x+4} ${y-1}" stroke="var(--mm-gold)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    down:(x,y)=>`<path d="M${x} ${y-6}V${y+5}M${x-4} ${y+1}L${x} ${y+5}L${x+4} ${y+1}" stroke="var(--mm-gold)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    left:(x,y)=>`<path d="M${x+6} ${y}H${x-5}M${x-1} ${y-4}L${x-5} ${y}L${x-1} ${y+4}" stroke="var(--mm-gold)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    right:(x,y)=>`<path d="M${x-6} ${y}H${x+5}M${x+1} ${y-4}L${x+5} ${y}L${x+1} ${y+4}" stroke="var(--mm-gold)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    rot:(x,y)=>`<path d="M${x+6} ${y}A6 6 0 1 1 ${x} ${y-6}M${x-3} ${y-9}L${x} ${y-6}L${x-3} ${y-3}" stroke="var(--mm-gold)" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    pulse:(x,y)=>`<path d="M${x-9} ${y-7}A11 11 0 0 1 ${x+9} ${y-7}M${x-13} ${y-11}A16 16 0 0 1 ${x+13} ${y-11}" stroke="var(--mm-gold)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>`,
    hold:(x,y)=>`<g><rect x="${x-13}" y="${y-7}" width="26" height="13" rx="6.5" fill="var(--mm-gold)"/><text x="${x}" y="${y+2.5}" text-anchor="middle" font-size="8" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">hold</text></g>`,
    thud:(x,y)=>`<path d="M${x-8} ${y-3}l-7 -4M${x-9} ${y+1}h-8M${x+12} ${y-3}l7 -4M${x+13} ${y+1}h8" stroke="var(--mm-gold)" stroke-width="2.4" stroke-linecap="round"/>`,
    wiggle:(x,y)=>`<path d="M${x-8} ${y}l4 -4l4 4l4 -4l4 4" stroke="var(--mm-gold)" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`};
  function draw(p){const P=pts(p),props=p.p||[],fd=p.fd??0;let s='';
    s+=`<path d="M4 104.5H116" stroke="var(--fig-floor)" stroke-width="1.5"/>`;
    props.filter(x=>x!=='bottles'&&x!=='bags').forEach(x=>s+=PROP[x]||'');
    const foot=(L,c)=>ln([L[1],ad(L[1],dv(fd,5.5))],5,c);
    /* far side */
    s+=ln([P.S,...P.A[1]],6,'var(--fig-far)');s+=ln([P.H,...P.L[1]],7,'var(--fig-far)')+foot(P.L[1],'var(--fig-far)');
    /* torso */
    const mid=[(P.H[0]+P.S[0])/2,(P.H[1]+P.S[1])/2],pp=dv(p.t-90,p.bend||0),c=ad(mid,[pp[0]*2,pp[1]*2]);
    s+=`<path d="M${f(P.H[0])} ${f(P.H[1])}Q${f(c[0])} ${f(c[1])} ${f(P.S[0])} ${f(P.S[1])}" stroke="var(--fig-torso)" stroke-width="12" stroke-linecap="round" fill="none"/>`;
    s+=`<circle cx="${f(P.He[0])}" cy="${f(P.He[1])}" r="7" fill="var(--mm-skin, #e7b99a)"/>`;
    /* near side */
    s+=ln([P.H,...P.L[0]],7,'var(--fig)')+foot(P.L[0],'var(--fig)');s+=ln([P.S,...P.A[0]],6,'var(--fig)');
    if(props.includes('bottles'))P.A.forEach((a,i)=>s+=`<rect x="${f(a[1][0]-2.5)}" y="${f(a[1][1]-5)}" width="5" height="11" rx="2" fill="${i?'var(--fig-far)':'var(--mm-sage)'}"/>`);
    if(props.includes('bags'))P.A.forEach((a,i)=>s+=`<path d="M${f(a[1][0]-3)} ${f(a[1][1]-1)}v-3M${f(a[1][0]+3)} ${f(a[1][1]-1)}v-3" stroke="${i?'var(--fig-far)':'var(--mm-gold)'}" stroke-width="1.6"/><path d="M${f(a[1][0]-8)} ${f(a[1][1]+1)}h16l-2 18h-12z" fill="${i?'var(--fig-far)':'var(--mm-gold)'}"/>`);
    (p.m||[]).forEach(([k,x,y])=>s+=MK[k](x,y));
    return s}
  /* zoom each move so its three frames share one tight view (lying poses get bigger) */
  const PB={chair:[32,58,68,104],chair2:[26,58,62,104],wall:[100,6,106,104],wallback:[34,4,86,104],step:[68,90,108,104],bench:[84,42,114,104],window:[84,8,112,38]};
  const vbCache={};
  function vb(name){if(vbCache[name])return vbCache[name];let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=(x,y,r=0)=>{x0=Math.min(x0,x-r);y0=Math.min(y0,y-r);x1=Math.max(x1,x+r);y1=Math.max(y1,y+r)};
    M[name].forEach(p=>{const P=pts(p);[P.H,P.S,...P.A.flat(),...P.L.flat()].forEach(q=>add(q[0],q[1],6));add(P.He[0],P.He[1],8);(p.p||[]).forEach(k=>{const b=PB[k];if(b){add(b[0],b[1]);add(b[2],b[3])}});(p.m||[]).forEach(([k,x,y])=>add(x,y,12))});
    add(60,104.5);let w=x1-x0+8,h=y1-y0+8;const ar=120/110;if(w/h<ar)w=h*ar;else h=w/ar;w=Math.min(w,120);h=Math.min(h,110);
    let cx=(x0+x1)/2,cy=(y0+y1)/2;let vx=Math.max(0,Math.min(120-w,cx-w/2)),vy=Math.max(0,Math.min(110-h,cy-h/2));
    return vbCache[name]=`${f(vx)} ${f(vy)} ${f(w)} ${f(h)}`}
  const frame=(p,name)=>`<svg viewBox="${name?vb(name):'0 0 120 110'}" class="figsvg" aria-hidden="true">${draw(p)}</svg>`;
  return{M,draw,frame,vb,has:n=>!!M[n]}})();
