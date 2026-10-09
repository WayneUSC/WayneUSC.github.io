/* SNAIL-only Habitat Studio 2.0 renderer for the native bilingual homepage.
 * Geometry is the existing public reference model. Textures are procedural;
 * Gaussians are sampled from its surfaces, never presented as a measured scan.
 * The host owns listeners, visibility, resizing and animation scheduling. */
import * as THREE from '../vendor/three/three.module.min.js';
import {HabitatRenderer as LegacyRenderer, SNAIL_MODEL} from './habitat-renderer.js';
import {createRenderKit} from './habitat-v2-kit.js';

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const V = {add: (a,b) => a.map((v,i) => v+b[i]), sub: (a,b) => a.map((v,i) => v-b[i]), mul: (a,n) => a.map(v => v*n)};
const PRESETS = {
  entry: {eye: [2.25,1.8,3.25], target: [0,1.25,-1.85]},
  living: {eye: [.5,1.85,1.4], target: [2.55,1,-1.15]},
  rest: {eye: [-.35,1.7,-1.05], target: [-1.95,.9,-2.35]},
  discussion: {eye: [1.6,1.85,-.7], target: [-1.7,1.05,1.8]}
};
const ZONES = {'会客':'#b58f59','休息':'#7aa896','研讨':'#8a9eb8','工作':'#8aa080','展示':'#9eaba3','过渡':'#bfab85'};

function compatibility(canvas, onSelect) {
  const renderer = new LegacyRenderer(canvas, onSelect);
  renderer.enhanced = false;
  renderer.representation = 'mesh';
  renderer.animating = false;
  renderer.setRepresentation = async () => 'mesh';
  renderer.setMaterialMode = mode => { renderer.mode = mode; renderer.dirty = true; };
  renderer.setCeiling = shown => { renderer.roof = !!shown; renderer.dirty = true; };
  return renderer;
}

export class HabitatRenderer {
  constructor(canvas, onSelect = () => {}, requestDraw = () => {}, options = {}) {
    const context = canvas.getContext('webgl2', {antialias: true, alpha: true, powerPreference: 'low-power'});
    if (!context) return compatibility(canvas, onSelect);
    this.canvas = canvas; this.onSelect = onSelect; this.requestDraw = requestDraw;
    this.preview = !!options.preview;
    this.enhanced = true; this.backend = 'WebGL2 · three.js r160';
    this.disposed = false; this.dirty = true; this.representation = 'mesh';
    this._mode = 'material'; this._selected = ''; this.moveKeys = Object.create(null);
    this.kit = createRenderKit(THREE);
    this.webgl = new THREE.WebGLRenderer({canvas, context, antialias: true, alpha: true});
    this.webgl.outputColorSpace = THREE.SRGBColorSpace;
    this.webgl.toneMapping = THREE.ACESFilmicToneMapping;
    this.webgl.toneMappingExposure = 1.1;
    this.webgl.setClearColor(0, 0);
    this.webgl.shadowMap.enabled = !this.preview;
    this.webgl.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.perspective = new THREE.PerspectiveCamera(50,1,.03,160);
    this.orthographic = new THREE.OrthographicCamera(-8,8,6,-6,.03,160);
    this.materials = new Map(); this.derivedMaterials = new Map();
    this.groups = []; this.meshes = [];
    try {
      const geometry = this.kit.buildFieldGeometry(SNAIL_MODEL, {bevel: true});
      this.groups = geometry.groups; this.objectBounds = geometry.entityBounds;
      this.triangles = geometry.triangles;
      this.groups.forEach((group, index) => {
        group.index = index;
        if (!this.materials.has(group.material)) {
          const material = this.kit.makeFieldMaterial(group.material, SNAIL_MODEL.materials[group.material]);
          // Fine relief stays subordinate to the reference geometry at room scale.
          if (material.bumpScale) material.bumpScale *= .015;
          this.materials.set(group.material, material);
        }
        group.pbr = this.materials.get(group.material);
        const mesh = new THREE.Mesh(group.geometry, group.pbr);
        mesh.userData.group = group;
        mesh.castShadow = !['glass','light','shadow'].includes(group.pbr.userData.kind)
          && group.section !== 'roof' && group.material !== 'rugLine';
        mesh.receiveShadow = group.pbr.userData.kind !== 'light';
        group.mesh = mesh; this.meshes.push(mesh); this.scene.add(mesh);
      });
      this.scene.add(new THREE.HemisphereLight('#fbf3e6','#b8a587',1.2));
      const key = new THREE.DirectionalLight('#fff3df',2.5);
      key.position.set(-7,12,6); key.target.position.set(0,.7,0);
      key.castShadow = !this.preview; key.shadow.mapSize.set(1536,1536);
      Object.assign(key.shadow.camera, {left:-9,right:9,top:9,bottom:-9,near:.5,far:40});
      key.shadow.bias = -.00035; key.shadow.normalBias = .018; key.shadow.radius = 3;
      this.keyLight = key; this.scene.add(key,key.target);
      const rim = new THREE.DirectionalLight('#d7e6f7',.6); rim.position.set(8,6,-7); this.scene.add(rim);
      this.selectionBox = new THREE.Box3Helper(new THREE.Box3(), '#24705a');
      this.selectionBox.material.transparent = true; this.selectionBox.material.opacity = .85;
      this.selectionBox.visible = false; this.scene.add(this.selectionBox);
      this.setView('overview');
    } catch (error) { this.dispose(); throw error; }
  }

  get animating() { return !!(this.generating || this.splat?.pending); }
  get mode() { return this._mode; }
  set mode(value) { this.setMaterialMode(value); }
  get selected() { return this._selected; }
  set selected(id) {
    this._selected = Object.hasOwn(SNAIL_MODEL.entities,id) ? id : '';
    if (this.selectionBox) {
      const box = this.objectBounds[this._selected];
      this.selectionBox.visible = !!box && !['envelope','ceiling','camera_mounts'].includes(id);
      if (box) this.selectionBox.box.copy(box).expandByScalar(.035);
    }
    this.refresh();
  }

  resize() {
    if (this.disposed) return false;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (!w || !h) return false;
    const budget = this.preview ? 950000 : 1800000;
    const ratio = Math.min(devicePixelRatio || 1, this.preview ? 1.25 : 1.6, Math.sqrt(budget/(w*h)));
    if (w !== this.w || h !== this.h || ratio !== this.ratio) {
      this.w=w; this.h=h; this.ratio=ratio;
      this.webgl.setPixelRatio(ratio); this.webgl.setSize(w,h,false); this.dirty=true;
    }
    return true;
  }

  matrices() {
    if (!this.resize()) return false;
    let target = this.target;
    if (this.fp) {
      this.eye=this.fpPos.slice();
      target=V.add(this.eye,[Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),Math.cos(this.yaw)*Math.cos(this.pitch)]);
    } else this.eye=V.add(target,[this.radius*Math.sin(this.yaw)*Math.cos(this.pitch),this.radius*Math.sin(this.pitch),this.radius*Math.cos(this.yaw)*Math.cos(this.pitch)]);
    if (this.ortho) {
      const height=Math.max(9.4,11.4*this.h/this.w)/this.zoom, width=height*this.w/this.h;
      this.camera=this.orthographic;
      Object.assign(this.camera,{left:-width/2,right:width/2,top:height/2,bottom:-height/2});
    } else {
      this.camera=this.perspective; this.camera.aspect=this.w/this.h;
      this.camera.fov=(this.fp ? .92 : 1/this.zoom)*180/Math.PI;
    }
    this.camera.position.set(...this.eye); this.camera.up.set(0,1,0);
    this.camera.lookAt(...target); this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld();
    return true;
  }

  setView(name='overview') {
    this.fp=false; this.clearKeys(); this.zoom=1;
    if (name==='overview' || name==='plan') {
      this.yaw=name==='plan'?0:.78; this.pitch=name==='plan'?1.545:.73;
      this.zoom=name==='plan'?1:.82;
      this.radius=17; this.target=[0,.9,0]; this.ortho=true; this.cutaway=true; this.roof=false;
    } else {
      const p=PRESETS[name] || PRESETS.entry, d=V.sub(p.eye,p.target);
      this.target=p.target.slice(); this.radius=Math.hypot(...d);
      this.yaw=Math.atan2(d[0],d[2]); this.pitch=Math.asin(d[1]/this.radius);
      this.ortho=false; this.cutaway=false; this.roof=true;
    }
    this.refresh();
  }
  setWalk(enabled) {
    if (!enabled) { this.setView('overview'); return; }
    this.fp=true; this.clearKeys(); this.fpPos=[3.2,1.62,2.75];
    this.yaw=Math.atan2(-1.9,-3.5); this.pitch=-.04; this.ortho=false; this.cutaway=false; this.roof=true; this.refresh();
  }
  orbit(dx,dy) { if(this.fp) return this.look(dx,dy); this.yaw-=dx*.006; this.pitch=clamp(this.pitch+dy*.005,-.22,1.545); this.dirty=true; }
  pan(dx,dy) { if(this.fp)return; const s=.012/this.zoom; this.target=V.add(this.target,[-dx*Math.cos(this.yaw)*s,dy*s,dx*Math.sin(this.yaw)*s]);this.dirty=true; }
  zoomBy(factor) { if(this.fp||!Number.isFinite(factor)||factor<=0)return;this.zoom=clamp(this.zoom*factor,.5,2.8);this.dirty=true; }
  look(dx,dy) { if(!this.fp)return;this.yaw-=dx*.004;this.pitch=clamp(this.pitch-dy*.004,-1.35,1.35);this.dirty=true; }
  clearKeys() { this.moveKeys=Object.create(null); }
  step(dt) {
    if(this.disposed||!this.fp||!Number.isFinite(dt)||dt<=0)return false;
    const k=this.moveKeys, f=[Math.sin(this.yaw),0,Math.cos(this.yaw)], r=[-Math.cos(this.yaw),0,Math.sin(this.yaw)];
    let move=[0,0,0];
    if(k.KeyW||k.ArrowUp)move=V.add(move,f);if(k.KeyS||k.ArrowDown)move=V.sub(move,f);
    if(k.KeyA||k.ArrowLeft)move=V.sub(move,r);if(k.KeyD||k.ArrowRight)move=V.add(move,r);
    if(k.Space)move[1]+=1;if(k.ShiftLeft||k.ShiftRight)move[1]-=1;
    const length=Math.hypot(...move);if(!length)return false;
    const speed=(k.AltLeft||k.AltRight) ? .95 : 2.05;
    this.fpPos=V.add(this.fpPos,V.mul(move,speed*Math.min(dt,.06)/length));
    this.fpPos[0]=clamp(this.fpPos[0],-3.95,3.95);this.fpPos[1]=clamp(this.fpPos[1],1,2.15);this.fpPos[2]=clamp(this.fpPos[2],-3.1,3.1);
    this.dirty=true;return true;
  }

  setCeiling(shown) { this.roof=!!shown; this.refresh(); }
  setMaterialMode(mode) { this._mode=['material','structure','zones'].includes(mode)?mode:'material'; this.refresh(); }
  visible(group) {
    return group.pbr.userData.kind!=='shadow' && !(group.section==='roof'&&!this.roof)
      && !(this.cutaway&&['east','front'].includes(group.section)) && !(this.mode==='structure'&&group.material==='rugLine');
  }
  materialFor(group) {
    let base=group.pbr, key='';
    if(this.mode==='structure'&&group.entity!=='envelope'&&group.material!=='glass') key='clay';
    else if(this.mode==='zones'&&!['envelope','ceiling','camera_mounts'].includes(group.entity)) key='zone:'+SNAIL_MODEL.entities[group.entity]?.zone;
    if(key) {
      if(!this.derivedMaterials.has(key)) this.derivedMaterials.set(key,new THREE.MeshStandardMaterial({color:key==='clay'?'#c7cfc7':ZONES[key.slice(5)]||'#9eaba3',roughness:.85}));
      base=this.derivedMaterials.get(key);
    }
    if(group.entity===this.selected&&!base.transparent) {
      const selectedKey='selected:'+base.uuid;
      if(!this.derivedMaterials.has(selectedKey)) {
        const selected=base.clone(); selected.emissive=new THREE.Color('#164e3a'); selected.emissiveIntensity=.22;
        this.derivedMaterials.set(selectedKey,selected);
      }
      base=this.derivedMaterials.get(selectedKey);
    }
    return base;
  }
  refresh() {
    if(this.disposed || !this.groups)return;
    const useSplats=this.representation!=='mesh'&&!!this.splat;
    for(const g of this.groups) {
      g.mesh.visible=this.visible(g)&&!useSplats; g.mesh.material=this.materialFor(g);
      if(this.splat) {
        const color=this.mode==='material'?null:this.materialFor(g).color;
        const rgb=color?[color.r,color.g,color.b].map(v=>Math.round(clamp(v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055,0,1)*255)):[255,255,255];
        this.splat.setGroup(g.index,rgb,this.visible(g),g.entity===this.selected);
      }
    }
    if(this.splat) {
      this.splat.mesh.visible=useSplats; this.splat.setMode(this.representation==='points'?2:0);
      this.splat.material.uniforms.uStyle.value=this.mode==='material'?0:1;this.splat.commitGroups();
    }
    this.dirty=true;
  }

  async setRepresentation(name) {
    if(this.disposed)return 'mesh';
    this.representation=['mesh','splats','points'].includes(name)?name:'mesh';
    if(this.representation==='mesh'||this.splat) {this.refresh();this.requestDraw();return this.representation;}
    if(!this.generation) {
      this.generating=true;
      const budget=this.preview?65000:(this.w<600?90000:140000);
      const groups=this.groups.filter(g=>g.pbr.userData.kind!=='shadow').map(g=>({geometry:g.geometry,material:g.pbr,groupIndex:g.index,weight:g.entity==='envelope'?.5:g.entity==='ceiling'?.4:g.material==='rugLine'?.5:1.35}));
      this.generation=this.kit.generateSplats(groups,budget,undefined,()=>this.disposed).then(data=>{
        if(this.disposed)return;
        this.splat=new this.kit.SplatMesh(data,this.groups.length);
        this.splat.material.uniforms.uGain.value=1.18;
        this.splat.onSorted=()=>{if(!this.disposed){this.dirty=true;this.requestDraw();}};
        this.splat.onError=()=>{if(!this.disposed){this.representation='mesh';this.refresh();this.requestDraw();}};
        this.scene.add(this.splat.mesh);
      }).finally(()=>{this.generating=false;this.generation=null;if(!this.disposed){this.refresh();this.requestDraw();}});
    }
    try {await this.generation;} catch(error) {if(!this.disposed){this.representation='mesh';this.refresh();throw error;}}
    return this.representation;
  }

  draw() {
    if(this.disposed||!this.matrices())return false;
    if(this.webgl.getContext().isContextLost()){this.dirty=true;return false;}
    this.scene.updateMatrixWorld(true);this.webgl.render(this.scene,this.camera);this.dirty=false;return true;
  }
  project(position) {
    if(!this.matrices())return [-999,-999,-1];
    const v=new THREE.Vector3(...position).project(this.camera);
    const behind=new THREE.Vector3(...position).applyMatrix4(this.camera.matrixWorldInverse).z>0;
    return [(v.x+1)*this.w/2,(1-v.y)*this.h/2,behind?2:v.z];
  }
  pickAt(clientX,clientY) {
    if(this.disposed||!this.matrices())return null;
    const rect=this.canvas.getBoundingClientRect(),ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((clientX-rect.left)/rect.width*2-1,1-(clientY-rect.top)/rect.height*2),this.camera);
    this.scene.updateMatrixWorld(true);
    const objects=this.groups.filter(g=>this.visible(g)&&g.pbr.opacity>=.25).map(g=>g.mesh);
    const hits=ray.intersectObjects(objects,false),id=hits[0]?.object.userData.group.entity;
    if(!id||['envelope','ceiling','camera_mounts'].includes(id))return null;
    this.selected=id;this.onSelect(id);return id;
  }
  dispose() {
    if(this.disposed)return;this.disposed=true;this.clearKeys();this.fp=false;
    this.splat?.dispose();
    const materials=new Set(),textures=new Set(),geometries=new Set();
    this.scene?.traverse(object=>{
      if(object.geometry)geometries.add(object.geometry);
      for(const m of [object.material].flat())if(m){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}
    });
    for(const material of [...(this.materials?.values()||[]),...(this.derivedMaterials?.values()||[])]) {
      materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
    }
    for(const geometry of geometries)geometry.dispose();
    for(const material of materials)material.dispose();
    for(const texture of textures)texture.dispose();
    this.keyLight?.shadow.map?.dispose();this.kit?.disposeCaches();
    this.webgl?.renderLists.dispose();this.webgl?.dispose();this.webgl?.forceContextLoss();
    this.scene?.clear();this.groups=[];this.meshes=[];this.materials?.clear();this.derivedMaterials?.clear();
    this.onSelect=()=>{};this.requestDraw=()=>{};
  }
}
