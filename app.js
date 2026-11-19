import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const cars=[
{brand:'BUGATTI',name:'CHIRON SUPER SPORT',short:'CHIRON SS',desc:'A landmark in grand touring performance. The Chiron Super Sport represents the pursuit of speed without compromise.',engine:'W16 QUAD-TURBO',layout:'REAR-MID',type:'W16',color:0x8d969b,img:'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1100&q=85'},
{brand:'KOENIGSEGG',name:'JESKO ATTACK',short:'JESKO ATTACK',desc:'A track-focused expression of extreme engineering, built around a high-revving twin-turbocharged V8.',engine:'V8 TWIN-TURBO',layout:'REAR-MID',type:'V8',color:0xb7b8b4,img:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=85'},
{brand:'KOENIGSEGG',name:'JESKO ABSOLUT',short:'JESKO ABSOLUT',desc:'The low-drag interpretation of the Jesko, shaped around high-speed stability and aerodynamic efficiency.',engine:'V8 TWIN-TURBO',layout:'REAR-MID',type:'V8',color:0x777e83,img:'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1100&q=85'},
{brand:'MCLAREN',name:'P1',short:'P1',desc:'A pioneering hybrid hypercar combining a twin-turbocharged V8 with electric assistance.',engine:'V8 HYBRID',layout:'REAR-MID',type:'V8 HYBRID',color:0x9c2728,img:'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1100&q=85'},
{brand:'FERRARI',name:'SF90 STRADALE',short:'SF90 STRADALE',desc:'A plug-in hybrid supercar combining a twin-turbo V8 with three electric motors.',engine:'V8 HYBRID',layout:'REAR-MID',type:'V8 HYBRID',color:0x9e2526,img:'https://images.unsplash.com/photo-1592198084033-aade?auto=format&fit=crop&w=1100&q=85'},
{brand:'LAMBORGHINI',name:'AVENTADOR SVJ',short:'AVENTADOR SVJ',desc:'A dramatic, naturally aspirated V12 machine with active aerodynamic technology.',engine:'NATURALLY ASPIRATED V12',layout:'MID-ENGINE',type:'V12',color:0x9b9c82,img:'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1100&q=85'},
{brand:'PORSCHE',name:'911 GT3 RS',short:'911 GT3 RS',desc:'A road-legal machine shaped by motorsport thinking, aerodynamic focus and driver involvement.',engine:'FLAT-SIX',layout:'REAR-ENGINE',type:'FLAT-SIX',color:0xd5d0c2,img:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=85'}
];
const $=id=>document.getElementById(id);
const grid=$('carGrid');
cars.forEach((c,i)=>{const el=document.createElement('article');el.className='car-card';el.innerHTML=`<img src="${c.img}" alt="Automotive image used as a visual reference for ${c.brand} ${c.name}" loading="lazy"><div class="car-info"><div><small>0${i+1} / ${c.brand}</small><strong>${c.name}</strong></div><b>↗</b></div>`;el.onclick=()=>selectCar(i);grid.appendChild(el)});

const viewer=$('carViewer');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x14181b);scene.fog=new THREE.Fog(0x14181b,13,27);
const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(6,4.1,8);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;viewer.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.06;controls.minDistance=4.5;controls.maxDistance=14;controls.maxPolarAngle=Math.PI*.48;controls.target.set(0,.8,0);
scene.add(new THREE.HemisphereLight(0xbac8d4,0x17191c,2));
const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(4,8,5);key.castShadow=true;scene.add(key);
const rim=new THREE.DirectionalLight(0x8ba6bd,2.4);rim.position.set(-6,4,-4);scene.add(rim);
const red=new THREE.PointLight(0xb93c36,30,12);red.position.set(0,2,-5);scene.add(red);
const floor=new THREE.Mesh(new THREE.CircleGeometry(12,80),new THREE.MeshStandardMaterial({color:0x171a1d,roughness:.34,metalness:.38}));floor.rotation.x=-Math.PI/2;floor.position.y=-.03;floor.receiveShadow=true;scene.add(floor);
const ring=new THREE.Mesh(new THREE.TorusGeometry(4.5,.012,8,120),new THREE.MeshBasicMaterial({color:0x52585b,transparent:true,opacity:.45}));ring.rotation.x=Math.PI/2;ring.position.y=.01;scene.add(ring);
const carRoot=new THREE.Group();scene.add(carRoot);
const bodyMat=new THREE.MeshPhysicalMaterial({color:cars[0].color,metalness:.82,roughness:.22,clearcoat:1,clearcoatRoughness:.12});
const darkMat=new THREE.MeshStandardMaterial({color:0x080a0c,metalness:.7,roughness:.25});
const glassMat=new THREE.MeshPhysicalMaterial({color:0x111a20,metalness:.5,roughness:.08,transparent:true,opacity:.92});
const alloyMat=new THREE.MeshStandardMaterial({color:0x9da3a4,metalness:.9,roughness:.22});
const rubberMat=new THREE.MeshStandardMaterial({color:0x08090a,roughness:.9});
let wheels=[],panels=[],parts={},autoRotate=true,exploded=false,lightsMode=0,current=0;
function box(parent,w,h,d,mat,x,y,z,bevel=0){const geo=new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cyl(parent,r1,r2,h,mat,x,y,z,rotZ=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,32),mat);m.position.set(x,y,z);m.rotation.z=rotZ;m.castShadow=true;parent.add(m);return m}
function buildCar(){
 while(carRoot.children.length)carRoot.remove(carRoot.children[0]);wheels=[];panels=[];
 const body=new THREE.Group();carRoot.add(body);
 // A bespoke procedural hypercar study silhouette. It is intentionally not represented as an exact OEM scan.
 const lower=box(body,2.15,.52,4.55,bodyMat,0,.65,0);lower.scale.set(1,1,1);
 const nose=box(body,1.9,.34,1.35,bodyMat,0,.74,1.52);nose.rotation.x=-.12;
 const cabin=new THREE.Mesh(new THREE.SphereGeometry(1,32,20,0,Math.PI*2,0,Math.PI*.48),glassMat);cabin.scale.set(.91,.67,1.34);cabin.position.set(0,1.02,-.25);cabin.castShadow=true;body.add(cabin);
 const roof=box(body,1.42,.11,1.4,darkMat,0,1.48,-.35);roof.rotation.x=-.08;
 const frontSplitter=box(body,2.25,.08,.5,darkMat,0,.42,2.15);
 const rearDiff=box(body,2.12,.16,.65,darkMat,0,.35,-2.12);
 const stripe=box(body,.055,.015,3.9,new THREE.MeshStandardMaterial({color:0x25292c,metalness:.8}),0,.92,0);
 // wheel arches and four wheels
 for(const x of [-1.04,1.04])for(const z of [-1.48,1.52]){
   const tire=new THREE.Mesh(new THREE.CylinderGeometry(.49,.49,.27,40),rubberMat);tire.rotation.z=Math.PI/2;tire.position.set(x,.48,z);tire.castShadow=true;body.add(tire);
   const rimMesh=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.285,32),alloyMat);rimMesh.rotation.z=Math.PI/2;rimMesh.position.copy(tire.position);body.add(rimMesh);
   const hub=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.30,24),darkMat);hub.rotation.z=Math.PI/2;hub.position.copy(tire.position);body.add(hub);
   for(let s=0;s<5;s++){const spoke=box(body,.025,.025,.48,alloyMat,x,.48,z);spoke.rotation.y=s*Math.PI/5;spoke.rotation.z=.0;}
   wheels.push(tire,rimMesh,hub);
 }
 // headlamps and taillamps
 for(const x of [-.73,.73]){const lamp=box(body,.38,.09,.13,new THREE.MeshStandardMaterial({color:0xdce7ee,emissive:0x7899aa,emissiveIntensity:1.5}),x,.78,2.22);lamp.rotation.y=x*.1;const tail=box(body,.55,.07,.1,new THREE.MeshStandardMaterial({color:0xb62d2d,emissive:0x8b1111,emissiveIntensity:1.2}),x,.82,-2.29); }
 // hinged rear deck, pivots upward for engine bay access
 const hinge=new THREE.Group();hinge.position.set(0,1.02,-1.42);body.add(hinge);
 const deck=box(hinge,1.8,.12,1.45,bodyMat,0,0,-.65);deck.rotation.x=-.12;panels.push({group:hinge,closed:0,open:-.9});
 // rear spoiler
 const spoiler=box(body,1.8,.09,.25,darkMat,0,1.15,-2.12);
 // engine assembly placed under deck
 const engine=new THREE.Group();engine.position.set(0,.91,-1.25);body.add(engine);
 const metal=new THREE.MeshStandardMaterial({color:0x777e80,metalness:.82,roughness:.3});
 const bright=new THREE.MeshStandardMaterial({color:0xb4b7b4,metalness:.88,roughness:.22});
 const redMat=new THREE.MeshStandardMaterial({color:0x9b2929,metalness:.65,roughness:.28});
 const block=box(engine,1.05,.48,1.05,metal,0,0,0);parts.block=block;
 for(let side of [-1,1]){const head=box(engine,.42,.24,.9,bright,side*.55,.3,0);head.rotation.z=side*.12;}
 // cylinder banks / intake runners
 for(let i=0;i<4;i++){const runner=cyl(engine,.065,.065,.72,bright,-.34+i*.225,.47,.02,Math.PI/2);runner.rotation.z=Math.PI/2;}
 const turboL=new THREE.Mesh(new THREE.TorusGeometry(.23,.09,12,28),redMat);turboL.position.set(-.72,.2,-.25);engine.add(turboL);const turboR=turboL.clone();turboR.position.x=.72;engine.add(turboR);parts.turbo=turboL;
 const intake=box(engine,1.25,.16,.42,darkMat,0,.52,.28);parts.intake=intake;
 const exhaustL=cyl(engine,.13,.13,.8,bright,-.7,-.05,-.5);const exhaustR=cyl(engine,.13,.13,.8,bright,.7,-.05,-.5);parts.exhaust=exhaustL;
 const cooling=box(engine,1.35,.1,.16,alloyMat,0,-.32,.55);parts.cooling=cooling;
 engine.visible=false;parts.engine=engine;parts.group=engine;parts.block=block;
 carRoot.userData={body,hinge,engine,deck,bodyMat,originalColor:cars[current].color};
 carRoot.scale.setScalar(1);carRoot.position.y=0;
}
buildCar();
function resize(){const w=viewer.clientWidth,h=viewer.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
new ResizeObserver(resize).observe(viewer);resize();
function animate(){requestAnimationFrame(animate);if(autoRotate&&!controls.dragging)carRoot.rotation.y+=.0022;controls.update();renderer.render(scene,camera)}animate();
setTimeout(()=>$('viewerLoader').classList.add('hidden'),700);
function selectCar(i){current=i;const c=cars[i];$('carIndex').textContent=String(i+1).padStart(3,'0');$('selectedName').innerHTML=`${c.brand}<br><em>${c.short}</em>`;$('selectedDesc').textContent=c.desc;$('specEngine').textContent=c.engine;$('specLayout').textContent=c.layout;carRoot.userData.bodyMat.color.setHex(c.color);carRoot.userData.originalColor=c.color;closeEngine();carRoot.rotation.y=0;controls.reset();$('viewerState').textContent='EXTERIOR VIEW';}
cars.forEach((c,i)=>{const el=document.createElement('article');el.className='car-card';el.innerHTML=`<img src="${c.img}" alt="Automotive reference image for ${c.brand} ${c.name}" loading="lazy"><div class="car-info"><div><small>0${i+1} / ${c.brand}</small><strong>${c.name}</strong></div><b>↗</b></div>`;el.onclick=()=>{selectCar(i);$('showroom').scrollIntoView({behavior:'smooth'})};grid.appendChild(el)});
function openEngine(){const u=carRoot.userData;u.engine.visible=true;u.hinge.rotation.x=-.9;u.engine.scale.setScalar(1);$('viewerState').textContent='ENGINE BAY OPEN';$('engineBtn').textContent='CLOSE ENGINE BAY ↗';camera.position.set(4,3.2,-5.6);controls.target.set(0,.85,-.9);controls.update()}
function closeEngine(){const u=carRoot.userData;u.engine.visible=false;u.hinge.rotation.x=0;$('viewerState').textContent='EXTERIOR VIEW';$('engineBtn').textContent='OPEN ENGINE BAY ↗';}
$('engineBtn').onclick=()=>carRoot.userData.engine.visible?closeEngine():openEngine();
$('resetView').onclick=()=>{closeEngine();carRoot.rotation.set(0,0,0);camera.position.set(6,4.1,8);controls.target.set(0,.8,0);controls.update();exploded=false;setExploded(false)};
$('rotateBtn').onclick=()=>{autoRotate=!autoRotate;$('rotateBtn').textContent=`AUTO ROTATE: ${autoRotate?'ON':'OFF'}`};
$('lightsBtn').onclick=()=>{lightsMode=(lightsMode+1)%3;key.intensity=[3.2,1.5,4.5][lightsMode];rim.intensity=[2.4,4.5,1.1][lightsMode];red.intensity=[30,10,55][lightsMode];$('lightsBtn').textContent=['STUDIO LIGHTING','COOL LIGHTING','DRAMATIC LIGHTING'][lightsMode]};
function setExploded(on){exploded=on;const g=carRoot.userData.engine;if(!g.visible)openEngine();const positions={block:[0,0,0],turbo:[-1.1,.5,0],intake:[0,1,0],exhaust:[1.05,-.1,0],cooling:[0,-.85,.4]};Object.entries(parts).forEach(([key,obj])=>{if(!obj?.position||!positions[key])return;const p=positions[key];obj.position.set(on?p[0]:0,on?p[1]:0,on?p[2]:0)});$('explodeBtn').textContent=on?'ASSEMBLE VIEW':'EXPLODED VIEW';$('viewerState').textContent=on?'EXPLODED COMPONENT STUDY':'ENGINE BAY OPEN'}
$('explodeBtn').onclick=()=>setExploded(!exploded);
$('engineMode').onclick=()=>{closeEngine();$('partsPanel').classList.remove('open');$('engineMode').classList.add('active');$('partsMode').classList.remove('active');$('explodedMode').classList.remove('active')};
$('partsMode').onclick=()=>{openEngine();$('partsPanel').classList.add('open');$('partsMode').classList.add('active');$('engineMode').classList.remove('active');$('explodedMode').classList.remove('active')};
$('explodedMode').onclick=()=>{setExploded(true);$('partsPanel').classList.add('open');$('explodedMode').classList.add('active');$('engineMode').classList.remove('active');$('partsMode').classList.remove('active')};
const descriptions={block:'The central engine block houses the cylinders and supports the major engine assemblies.',turbo:'Turbochargers use exhaust energy to compress intake air. This illustrative twin-turbo layout is representative, not model-specific.',intake:'The intake system routes and distributes air to the engine. Its exact architecture differs by manufacturer.',exhaust:'Exhaust components route hot gases away from the engine and form part of the thermal and acoustic system.',cooling:'Cooling components help manage operating temperatures under demanding conditions.'};
document.querySelectorAll('.part-chip').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.part-chip').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$('partDescription').textContent=descriptions[btn.dataset.part];});
$('menuBtn').onclick=()=>$('nav').classList.toggle('open');document.querySelectorAll('#nav a').forEach(a=>a.onclick=()=>$('nav').classList.remove('open'));
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeEngine()});
function closeEngine(){const u=carRoot.userData;u.engine.visible=false;u.hinge.rotation.x=0;$('viewerState').textContent='EXTERIOR VIEW';$('engineBtn').textContent='OPEN ENGINE BAY ↗';if(exploded){exploded=false;Object.values(parts).forEach(o=>{if(o?.position)o.position.set(0,0,0)})}}
