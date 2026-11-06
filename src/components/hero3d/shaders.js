// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT).
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const orbVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uImpulse;
uniform float uOctaves;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${NOISE}
float fbm(vec3 p){
  float s=0.0; float a=0.5;
  for(int i=0;i<3;i++){
    if(float(i)>=uOctaves) break;
    s+=a*snoise(p); p*=2.03; a*=0.5;
  }
  return s;
}
vec3 displace(vec3 p){
  vec3 n=normalize(p);
  float d=fbm(n*1.55+vec3(0.0,uTime*0.11,uTime*0.07));
  d+=uImpulse*0.22*sin(9.0*n.y-uTime*7.0);
  return n*(1.0+uAmp*d);
}
void main(){
  vec3 n=normalize(position);
  vec3 t=normalize(cross(n,abs(n.y)<0.99?vec3(0.0,1.0,0.0):vec3(1.0,0.0,0.0)));
  vec3 b=cross(n,t);
  float e=0.012;
  vec3 d0=displace(position);
  vec3 d1=displace(position+t*e);
  vec3 d2=displace(position+b*e);
  vec3 dn=normalize(cross(d1-d0,d2-d0));
  if(dot(dn,n)<0.0) dn=-dn;
  vec4 mv=modelViewMatrix*vec4(d0,1.0);
  vNormal=normalize(normalMatrix*dn);
  vView=normalize(-mv.xyz);
  vDisp=length(d0)-1.0;
  gl_Position=projectionMatrix*mv;
}
`;

export const orbFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uRim;
uniform float uLight;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
void main(){
  vec3 N=normalize(vNormal);
  float fres=pow(1.0-max(dot(N,normalize(vView)),0.0),2.4);
  float t=smoothstep(-0.12,0.16,vDisp+N.y*0.22);
  vec3 col=mix(uColorB,uColorA,t);
  float diff=max(dot(N,normalize(vec3(0.45,0.8,0.6))),0.0);
  col*=mix(0.42,0.75,uLight)+0.6*diff;
  // Light theme: lift the body toward white and use a pale rim so the orb reads as glassy, not heavy.
  col=mix(col,vec3(1.0),uLight*0.2);
  vec3 rim=mix(uRim,mix(uColorA,vec3(1.0),0.55),uLight);
  col+=rim*fres*mix(1.15,0.95,uLight);
  gl_FragColor=vec4(col,1.0);
  #include <colorspace_fragment>
}
`;

export const pointsVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
attribute float aSeed;
varying float vAlpha;
void main(){
  vec3 p=position;
  float a=uTime*(0.04+aSeed*0.05);
  float c=cos(a), s=sin(a);
  p.xz=mat2(c,-s,s,c)*p.xz;
  p.y+=sin(uTime*0.5+aSeed*6.283)*0.04;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_PointSize=uSize*uPixelRatio*(0.6+aSeed)*(3.0/-mv.z);
  vAlpha=0.35+0.65*aSeed;
  gl_Position=projectionMatrix*mv;
}
`;

export const pointsFragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-0.5);
  float a=smoothstep(0.5,0.0,d)*vAlpha;
  if(a<0.01) discard;
  gl_FragColor=vec4(uColor,a);
  #include <colorspace_fragment>
}
`;
