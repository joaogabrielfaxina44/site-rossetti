/* Standalone MetalFx WebGL2 + Canvas Glow & Liquid Bend Engine extracted from Overview */
(function () {
  var currentComponent = null;
  function Mi(init) {
    var comp = currentComponent;
    var idx = comp.hookIdx++;
    if (comp.hooks.length <= idx) {
      comp.hooks[idx] = typeof init === 'function' ? init() : init;
    }
    var setState = function (val) {
      var next = typeof val === 'function' ? val(comp.hooks[idx]) : val;
      if (next !== comp.hooks[idx]) {
        comp.hooks[idx] = next;
        comp.render();
      }
    };
    return [comp.hooks[idx], setState];
  }
  function st(init) {
    var comp = currentComponent;
    var idx = comp.hookIdx++;
    if (comp.hooks.length <= idx) {
      comp.hooks[idx] = { current: init };
    }
    return comp.hooks[idx];
  }
  function Br(fn) {
    var comp = currentComponent;
    var idx = comp.hookIdx++;
    if (comp.hooks.length <= idx) {
      comp.hooks[idx] = fn();
    }
    return comp.hooks[idx];
  }
  function el() {}
  function bt(fn) {
    var comp = currentComponent;
    comp.effects.push(fn);
  }
  function tl(fn) {
    var comp = currentComponent;
    comp.layoutEffects.push(fn);
  }
  function Zs(fn) { return fn; }
  function Ea(tag, props) { return { tag: tag, props: props || {} }; }
  function Ks(tag, props) { return { tag: tag, props: props || {} }; }

function Or(e){let t=e.replace("#","");(t.length===3||t.length===4)&&(t=t.split("").map(n=>n+n).join(""));let a=t.length>=8?parseInt(t.slice(6,8),16)/255:1;return[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255,a]}function Ei(e,t,a){e/=255,t/=255,a/=255;let n=Math.max(e,t,a),o=Math.min(e,t,a),i=n-o,r=0,d=n===0?0:i/n;return i!==0&&(n===e?r=((t-a)/i+6)%6:n===t?r=(a-e)/i+2:r=(e-t)/i+4,r/=6),[r,d,n]}function Ri(e,t,a){let n=Math.floor(e*6),o=e*6-n,i=a*(1-t),r=a*(1-o*t),d=a*(1-(1-o)*t),l=0,u=0,c=0;switch(n%6){case 0:l=a,u=d,c=i;break;case 1:l=r,u=a,c=i;break;case 2:l=i,u=a,c=d;break;case 3:l=i,u=r,c=a;break;case 4:l=d,u=i,c=a;break;case 5:l=a,u=i,c=r;break}return[Math.round(l*255),Math.round(u*255),Math.round(c*255)]}var al=66,ol=66,nl=1500,rl=1,Fr=16,il=96,sl=2,ll=0;var cl=1;var Ha={colorBack:"#00000000",speed:1,repetition:1.5,softness:.05,shiftRed:.3,shiftBlue:.3,distortion:.1,contour:.4,angle:90,shape:ll,scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,fit:cl},dl={name:"chromatic",modes:{dark:{...Ha,colorTint:"#88ccff2e",shiftRed:.75,shiftBlue:.75,repetition:2,softness:.09,shaderOpacity:1},light:{...Ha,colorTint:"#66b0ff99",shiftRed:.6,shiftBlue:.6,shaderOpacity:1}}},ul={name:"silver",modes:{dark:{...Ha,colorTint:"#ffffff66",shaderOpacity:.88},light:{...Ha,colorTint:"#ffffff40",shaderOpacity:1}}},hl={name:"gold",modes:{dark:{...Ha,colorTint:"#ffcc55cc",speed:.85,shaderOpacity:.92},light:{...Ha,colorTint:"#f7d488aa",shaderOpacity:1}}},Si={chromatic:dl,silver:ul,gold:hl},pl=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,ml=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,fl=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,gl=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`,vl=`#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;

${pl}
${ml}
${gl}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${fl}

  fragColor = vec4(color, opacity);
}
`,xl=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`,yl=vl;function Dr(e,t,a){let n=e.createShader(t);if(!n)throw new Error("metal-fx: gl.createShader returned null");if(e.shaderSource(n,a),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){let o=e.getShaderInfoLog(n);throw e.deleteShader(n),new Error(`metal-fx: shader compile failed: ${o??"(no info log)"}`)}return n}function wl(e,t,a){let n=e.createProgram();if(!n)throw new Error("metal-fx: gl.createProgram returned null");if(e.attachShader(n,t),e.attachShader(n,a),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){let o=e.getProgramInfoLog(n);throw e.deleteProgram(n),new Error(`metal-fx: program link failed: ${o??"(no info log)"}`)}return n}var Ti=140,Ci=40,ki=1.6,Ai=1.3,T=null,Ra=null;function bl(){var e;if(Ra!==null)return Ra;if(typeof document>"u")return Ra=!1;try{let t=document.createElement("canvas").getContext("webgl2");Ra=!!t,(e=t?.getExtension("WEBGL_lose_context"))==null||e.loseContext()}catch{Ra=!1}return Ra}var Cn=null;function Ml(e){Cn=e}var El=["u_resolution","u_time","u_pixelRatio","u_colorBack","u_colorTint","u_repetition","u_softness","u_shiftRed","u_shiftBlue","u_distortion","u_contour","u_angle","u_shape","u_isImage","u_image","u_originX","u_originY","u_worldWidth","u_worldHeight","u_fit","u_scale","u_rotation","u_offsetX","u_offsetY","u_imageAspectRatio"];function zr(e){e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA);let t=Dr(e,e.VERTEX_SHADER,xl),a=Dr(e,e.FRAGMENT_SHADER,yl),n=wl(e,t,a);e.useProgram(n);let o=e.createBuffer();if(!o)throw new Error("metal-fx: gl.createBuffer returned null");e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);let i=e.getAttribLocation(n,"a_position");e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0);let r={};for(let l of El)r[l]=e.getUniformLocation(n,l);let d=e.createTexture();return d&&(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,d),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),r.u_image&&e.uniform1i(r.u_image,0)),{program:n,buffer:o,uniforms:r,dummyTexture:d}}function _i(){if(T)return T;let e=Math.min(sl,typeof window<"u"&&window.devicePixelRatio||1),t=Math.round(il*e),a=typeof OffscreenCanvas<"u",n,o;if(a)n=new OffscreenCanvas(t,t),o=n.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});else{let s=document.createElement("canvas");s.width=t,s.height=t,o=s.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,preserveDrawingBuffer:!0}),n=s}if(!o)throw new Error("metal-fx: WebGL2 not supported");let{program:i,buffer:r,uniforms:d,dummyTexture:l}=zr(o),u=s=>{s.preventDefault(),T&&(T.contextLost=!0)},c=()=>{if(!T)return;let s=zr(T.gl);T.program=s.program,T.buffer=s.buffer,T.uniforms=s.uniforms,T.dummyTexture=s.dummyTexture,T.presetDirty=!0,T.contextLost=!1,Cn?.()};return n.addEventListener("webglcontextlost",u,!1),n.addEventListener("webglcontextrestored",c,!1),T={glCanvas:n,gl:o,program:i,buffer:r,uniforms:d,dummyTexture:l,preset:Si.chromatic.modes.dark,presetDirty:!0,contextLost:!1,useOffscreen:a,frameBitmap:null,startMs:performance.now(),pausedMs:0,pausedAtMs:null,rafId:0,dpr:e,instances:new Set,frameCount:0,glowQueue:[],glowIdx:0,glowSkip:0,glowPixels:new Uint8Array(t*t*4),glowPixelsW:t,glowPixelsH:t},T}function Rl(){var e;if(!T)return;let{gl:t,program:a,buffer:n,frameBitmap:o,dummyTexture:i}=T;try{o?.close(),t.deleteBuffer(n),t.deleteProgram(a),i&&t.deleteTexture(i),(e=t.getExtension("WEBGL_lose_context"))==null||e.loseContext()}catch{}T=null}var Ur=0;function Sl(){if(!T)return;let e=performance.now();if(e-Ur<nl)return;Ur=e;let{gl:t,glCanvas:a}=T,n=a.width,o=a.height;(T.glowPixelsW!==n||T.glowPixelsH!==o)&&(T.glowPixelsW=n,T.glowPixelsH=o,T.glowPixels=new Uint8Array(n*o*4)),t.readPixels(0,0,n,o,t.RGBA,t.UNSIGNED_BYTE,T.glowPixels)}var Sa={bx:0,by:0};function Go(e,t,a){if(!T)return Sa.bx=0,Sa.by=0,Sa;let{glCanvas:n}=T,o=n.width,i=n.height,r=e.dpr,d=e.cssWidth*r,l=e.cssHeight*r,u=Ti*r,c=Ci*r,s=d*(o/u)/e.shaderScale,p=l*(i/c)/e.shaderScale;s>o&&(s=o),p>i&&(p=i);let h=(o-s)/2,f=(i-p)/2,g=h+t/e.cssWidth*s,b=f+a/e.cssHeight*p;return Sa.bx=Math.round(g),Sa.by=Math.round(i-1-b),Sa}var et={r:0,g:0,b:0,lum:0,count:0};function Li(e,t,a,n,o,i){let r=Math.max(1,i|0),d=Math.max(0,n-r),l=Math.min(t,n+r+1),u=Math.max(0,o-r),c=Math.min(a,o+r+1);et.r=0,et.g=0,et.b=0,et.lum=0,et.count=0;for(let s=u;s<c;s++){let p=s*t;for(let h=d;h<l;h++){let f=(p+h)*4;et.r+=e[f],et.g+=e[f+1],et.b+=e[f+2],et.lum+=(.2126*e[f]+.7152*e[f+1]+.0722*e[f+2])/255,et.count++}}return et}var Te={r:255,g:255,b:255};function kn(e,t,a,n){if(!T)return 0;let o=Go(e,t,a),i=Li(T.glowPixels,T.glowPixelsW,T.glowPixelsH,o.bx,o.by,n);return i.count>0?i.lum/i.count:0}function Ii(e,t,a,n){if(!T)return Te.r=255,Te.g=255,Te.b=255,Te;let o=Go(e,t,a),i=Li(T.glowPixels,T.glowPixelsW,T.glowPixelsH,o.bx,o.by,n);return i.count===0?(Te.r=255,Te.g=255,Te.b=255,Te):(Te.r=i.r/i.count,Te.g=i.g/i.count,Te.b=i.b/i.count,Te)}function Tl(e,t,a,n){if(!T)return Te.r=255,Te.g=255,Te.b=255,Te;let o=Go(e,t,a),{glowPixels:i,glowPixelsW:r,glowPixelsH:d}=T,l=Math.max(1,n|0),u=Math.max(0,o.bx-l),c=Math.min(r,o.bx+l+1),s=Math.max(0,o.by-l),p=Math.min(d,o.by+l+1),h=-1;Te.r=255,Te.g=255,Te.b=255;for(let f=s;f<p;f++){let g=f*r;for(let b=u;b<c;b++){let M=(g+b)*4,x=i[M],m=i[M+1],y=i[M+2],v=Math.max(x,m,y),L=Math.min(x,m,y),k=(v>0?(v-L)/v:0)*(.35+.65*(v/255));k>h&&(h=k,Te.r=x,Te.g=m,Te.b=y)}}return Te}var tt={r:255,g:255,b:255,lum:0};function Cl(e,t,a,n){if(tt.r=255,tt.g=255,tt.b=255,tt.lum=0,!T)return tt;let o=Go(e,t,a),{glowPixels:i,glowPixelsW:r,glowPixelsH:d}=T,l=Math.max(1,n|0),u=Math.max(0,o.bx-l),c=Math.min(r,o.bx+l+1),s=Math.max(0,o.by-l),p=Math.min(d,o.by+l+1);for(let h=s;h<p;h++){let f=h*r;for(let g=u;g<c;g++){let b=(f+g)*4,M=(.2126*i[b]+.7152*i[b+1]+.0722*i[b+2])/255;M>tt.lum&&(tt.lum=M,tt.r=i[b],tt.g=i[b+1],tt.b=i[b+2])}}return tt}var gn=14,Nr=1.5,vn={x:0,y:0};function Pa(e=512){return{xy:new Float32Array(e*2),n:0}}function Ba(e,t,a,n,o,i,r=Pa()){o=Math.max(0,Math.min(o,Math.min(a,n)/2));let d=4*(gn+1)+Math.ceil(2*(a+n)/Nr)+8;r.xy.length<d*2&&(r.xy=new Float32Array(d*2));let l=r.xy,u=0,c=(h,f)=>{i?(i(h,f,vn),l[u*2]=vn.x,l[u*2+1]=vn.y):(l[u*2]=h,l[u*2+1]=f),u++},s=(h,f,g,b)=>{let M=Math.hypot(g-h,b-f),x=Math.max(1,Math.ceil(M/Nr));for(let m=0;m<x;m++){let y=m/x;c(h+(g-h)*y,f+(b-f)*y)}},p=(h,f,g,b)=>{for(let M=0;M<=gn;M++){let x=g+(b-g)*(M/gn);c(h+o*Math.cos(x),f+o*Math.sin(x))}};return s(e+o,t,e+a-o,t),p(e+a-o,t+o,-Math.PI/2,0),s(e+a,t+o,e+a,t+n-o),p(e+a-o,t+n-o,0,Math.PI/2),s(e+a-o,t+n,e+o,t+n),p(e+o,t+n-o,Math.PI/2,Math.PI),s(e,t+n-o,e,t+o),p(e+o,t+o,Math.PI,1.5*Math.PI),r.n=u,r}Ml(()=>{T&&T.instances.size>0&&T.pausedAtMs===null&&ho()});typeof document<"u"&&document.addEventListener("visibilitychange",()=>{!T||T.pausedAtMs!==null||T.contextLost||(document.hidden?Oi():T.instances.size>0&&ho())});function kl(e){let t=_i(),a=e.hostCanvas.getContext("2d",{alpha:!0});if(!a)throw new Error("metal-fx: canvas 2D context unavailable");let n=e.scale??1,o={canvas:e.hostCanvas,ctx:a,cssWidth:e.cssWidth,cssHeight:e.cssHeight,cornerRadius:e.cornerRadius,kind:e.kind,ringCssPx:e.ringCssPx??(e.kind==="circle"?2:1)*n,shaderScale:e.shaderScale??(e.kind==="circle"?Ai:ki)*n,opacityMul:e.opacityMul??1,glowGain:e.glowGain??1,visible:!0,paused:e.paused??!1,everCopied:!1,frozen:null,dpr:typeof window<"u"&&window.devicePixelRatio||1,scale:n,onAfterFrame:e.onAfterFrame,onComposite:e.onComposite,onFirstCopy:e.onFirstCopy,mask:e.mask??null,deform:null,deformLayers:null,overscan:0,cursorLight:null,glowFast:!1,rawCanvas:null,wantRaw:!1,ringCanvas:null,wantRing:!1};return Wo(o),t.instances.add(o),t.rafId===0&&t.pausedAtMs===null&&ho(),o}function Al(e){if(!T)return;T.instances.delete(e);let t=T.glowQueue.indexOf(e);t!==-1&&T.glowQueue.splice(t,1),T.instances.size===0&&(Oi(),Rl())}function _l(e){T&&(T.glowQueue.includes(e)||T.glowQueue.push(e))}function Ll(e){if(!T)return;let t=T.glowQueue.indexOf(e);t!==-1&&T.glowQueue.splice(t,1)}function Ta(e,t){let a=!1;t.mask!==void 0&&(e.mask=t.mask),t.cssWidth!==void 0&&t.cssWidth!==e.cssWidth&&(e.cssWidth=t.cssWidth,a=!0),t.cssHeight!==void 0&&t.cssHeight!==e.cssHeight&&(e.cssHeight=t.cssHeight,a=!0),t.cornerRadius!==void 0&&(e.cornerRadius=t.cornerRadius),t.scale!==void 0&&(e.scale=t.scale),t.kind!==void 0&&t.kind!==e.kind&&(e.kind=t.kind,t.shaderScale===void 0&&(e.shaderScale=(t.kind==="circle"?Ai:ki)*e.scale),t.ringCssPx===void 0&&(e.ringCssPx=(t.kind==="circle"?2:1)*e.scale)),t.shaderScale!==void 0&&(e.shaderScale=t.shaderScale),t.ringCssPx!==void 0&&(e.ringCssPx=t.ringCssPx),t.opacityMul!==void 0&&(e.opacityMul=t.opacityMul),t.glowGain!==void 0&&(e.glowGain=t.glowGain),t.paused!==void 0&&t.paused!==e.paused&&(e.paused=t.paused,t.paused?Pi(e):e.frozen=null,!t.paused&&T&&T.rafId===0&&T.pausedAtMs===null&&!T.contextLost&&ho()),a&&Wo(e)}function Il(e,t){e.visible=t,t&&T&&T.rafId===0&&T.pausedAtMs===null&&!T.contextLost&&ho()}function $r(e,t,a=null,n=0){let o=Hi(e);if(!o)return!1;o.deform=t,o.deformLayers=t?a:null;let i=t?Math.max(0,Math.round(n)):0;return i!==o.overscan&&(o.overscan=i,Wo(o)),Vo(o),!0}function Hl(e){return(typeof window<"u"&&window.devicePixelRatio||1)===e.dpr?!1:(Wo(e),Vo(e),!0)}function Pl(e){let t=Hi(e);t&&Vo(t)}function Hi(e){if(!T)return null;for(let t of T.instances)if(t.canvas===e)return t;return null}var Bl=null;function Ol(e,t){let a=_i();a.preset=Bl??Si[e].modes[t],a.presetDirty=!0}var oa=null;function Fl(e){oa=e}function xn(e,t){!oa||!T||!e.visible||e.paused||T.glowQueue.includes(e)&&(e.glowFast=!!oa(e,t))}function Wo(e){e.dpr=typeof window<"u"&&window.devicePixelRatio||1;let t=e.overscan,a=Math.max(1,Math.round((e.cssWidth+2*t)*e.dpr)),n=Math.max(1,Math.round((e.cssHeight+2*t)*e.dpr));e.canvas.width!==a&&(e.canvas.width=a),e.canvas.height!==n&&(e.canvas.height=n);let o=e.canvas.style;t>0?(o.left=`${-t}px`,o.top=`${-t}px`,o.width=`calc(100% + ${2*t}px)`,o.height=`calc(100% + ${2*t}px)`,o.borderRadius="0"):o.left!==""&&(o.left="",o.top="",o.width="100%",o.height="100%",o.borderRadius="")}function Dl(e){let{ctx:t,dpr:a,canvas:n}=e,o=e.ringCssPx*a,i=n.width,r=n.height,d=Math.max(0,(e.cornerRadius-e.ringCssPx)*a);t.save(),t.globalCompositeOperation="destination-out",t.fillStyle="#000",t.beginPath(),t.roundRect(o,o,i-2*o,r-2*o,d),t.fill(),t.restore()}var zl=Pa();function ea(e,t,a,n,o,i,r,d){let{xy:l,n:u}=Ba(t,a,n,o,i,r,zl);e.beginPath();for(let c=0;c<u;c++)c===0?e.moveTo(l[0]*d,l[1]*d):e.lineTo(l[c*2]*d,l[c*2+1]*d);e.closePath()}function Pi(e){if(!T)return null;let t=T.frameBitmap??T.glCanvas,a=T.glCanvas.width,n=T.glCanvas.height;if(a<1||n<1)return null;let o=e.frozen;o||(o=document.createElement("canvas"),e.frozen=o),(o.width!==a||o.height!==n)&&(o.width=a,o.height=n);let i=o.getContext("2d");return i?(i.clearRect(0,0,a,n),i.drawImage(t,0,0),o):(e.frozen=null,null)}function Vo(e){var t,a;if(!T)return;let n=(e.paused?e.frozen??Pi(e):null)??T.frameBitmap??T.glCanvas,o=e.dpr,i=e.canvas.width,r=e.canvas.height;if(i<1||r<1)return;let d=Math.max(1,Math.round(e.cssWidth*o)),l=Math.max(1,Math.round(e.cssHeight*o)),u=e.overscan*o,c=n.width,s=n.height,p=Ti*o,h=Ci*o,f=d*(c/p)/e.shaderScale,g=l*(s/h)/e.shaderScale;f>c&&(f=c),g>s&&(g=s);let b=Math.max(0,(c-f)/2),M=Math.max(0,(s-g)/2),x=e.opacityMul*T.preset.shaderOpacity,m=e.ctx;m.clearRect(0,0,i,r);let y=e.deform;if(e.mask){if(x<1&&(m.globalAlpha=x),m.drawImage(n,b,M,f,g,0,0,i,r),x<1&&(m.globalAlpha=1),e.wantRaw){let v=e.rawCanvas;v||(v=document.createElement("canvas"),e.rawCanvas=v),(v.width!==i||v.height!==r)&&(v.width=i,v.height=r);let L=v.getContext("2d");L&&(L.clearRect(0,0,i,r),L.drawImage(e.canvas,0,0))}m.save(),m.globalCompositeOperation="destination-in",m.fillStyle="#000",e.mask(m,i,r,o),m.restore(),m.globalCompositeOperation="source-over"}else if(!y)x<1&&(m.globalAlpha=x),m.drawImage(n,b,M,f,g,0,0,i,r),x<1&&(m.globalAlpha=1),Dl(e);else{let v=e.cssWidth,L=e.cssHeight,k=e.cornerRadius,A=e.ringCssPx,S=e.deformLayers;m.save(),m.translate(u,u);let H=d/f,E=l/g,_=Math.min(c,f*(d+2*u)/d),w=Math.min(s,g*(l+2*u)/l),I=Math.max(0,(c-_)/2),O=Math.max(0,(s-w)/2),F=_*H,D=w*E;if(x<1&&(m.globalAlpha=x),m.drawImage(n,I,O,_,w,d/2-F/2,l/2-D/2,F,D),x<1&&(m.globalAlpha=1),m.globalCompositeOperation="destination-in",ea(m,0,0,v,L,k,y,o),m.fillStyle="#000",m.fill(),m.globalCompositeOperation="destination-out",ea(m,A,A,v-2*A,L-2*A,Math.max(0,k-A),y,o),m.fill(),e.wantRing){let B=e.ringCanvas;B||(B=document.createElement("canvas"),e.ringCanvas=B),(B.width!==i||B.height!==r)&&(B.width=i,B.height=r);let U=B.getContext("2d");U&&(U.setTransform(1,0,0,1,0,0),U.globalCompositeOperation="source-over",U.clearRect(0,0,i,r),U.translate(u,u),x<1&&(U.globalAlpha=x),U.drawImage(n,I,O,_,w,d/2-F/2,l/2-D/2,F,D),U.globalAlpha=1,U.globalCompositeOperation="destination-out",ea(U,A,A,v-2*A,L-2*A,Math.max(0,k-A),y,o),U.fillStyle="#000",U.fill(),U.globalCompositeOperation="source-over",U.setTransform(1,0,0,1,0,0))}if(S!=null&&S.hairline){let B=S.hairline;m.globalCompositeOperation="destination-over",ea(m,B.inset,B.inset,v-2*B.inset,L-2*B.inset,Math.max(0,k-B.inset),y,o),m.lineWidth=B.width*o,m.strokeStyle=B.color,m.stroke()}if(S!=null&&S.fill&&(m.globalCompositeOperation="destination-over",ea(m,0,0,v,L,k,y,o),m.fillStyle=S.fill,m.fill()),S!=null&&S.rim){let B=S.rim;m.globalCompositeOperation="source-over",m.save(),ea(m,0,0,v,L,k,y,o),m.clip();let U=B.inset+B.width/2;ea(m,U,U,v-2*U,L-2*U,Math.max(0,k-U),y,o),m.lineWidth=B.width*o,m.strokeStyle=B.color,m.stroke(),m.restore()}m.restore(),m.globalCompositeOperation="source-over"}if((t=e.onComposite)==null||t.call(e),e.onFirstCopy){let v=e.onFirstCopy;e.onFirstCopy=void 0,v()}(a=e.onAfterFrame)==null||a.call(e)}function Ul(){if(!T)return;let{gl:e,uniforms:t,preset:a,glCanvas:n,dpr:o}=T;t.u_resolution&&e.uniform2f(t.u_resolution,n.width,n.height),t.u_pixelRatio&&e.uniform1f(t.u_pixelRatio,o),t.u_colorBack&&e.uniform4fv(t.u_colorBack,Or(a.colorBack)),t.u_colorTint&&e.uniform4fv(t.u_colorTint,Or(a.colorTint)),t.u_repetition&&e.uniform1f(t.u_repetition,a.repetition),t.u_softness&&e.uniform1f(t.u_softness,a.softness),t.u_shiftRed&&e.uniform1f(t.u_shiftRed,a.shiftRed),t.u_shiftBlue&&e.uniform1f(t.u_shiftBlue,a.shiftBlue),t.u_distortion&&e.uniform1f(t.u_distortion,a.distortion),t.u_contour&&e.uniform1f(t.u_contour,a.contour),t.u_angle&&e.uniform1f(t.u_angle,a.angle),t.u_shape&&e.uniform1f(t.u_shape,a.shape),t.u_isImage&&e.uniform1i(t.u_isImage,0),t.u_imageAspectRatio&&e.uniform1f(t.u_imageAspectRatio,1),t.u_originX&&e.uniform1f(t.u_originX,a.originX),t.u_originY&&e.uniform1f(t.u_originY,a.originY),t.u_worldWidth&&e.uniform1f(t.u_worldWidth,a.worldWidth),t.u_worldHeight&&e.uniform1f(t.u_worldHeight,a.worldHeight),t.u_fit&&e.uniform1f(t.u_fit,a.fit),t.u_scale&&e.uniform1f(t.u_scale,a.scale),t.u_rotation&&e.uniform1f(t.u_rotation,a.rotation),t.u_offsetX&&e.uniform1f(t.u_offsetX,a.offsetX),t.u_offsetY&&e.uniform1f(t.u_offsetY,a.offsetY),T.presetDirty=!1}function Nl(e){if(!T)return;let{gl:t,uniforms:a,preset:n,glCanvas:o}=T,i=(e-T.startMs-T.pausedMs)/1e3*n.speed;t.viewport(0,0,o.width,o.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),T.presetDirty&&Ul(),a.u_time&&t.uniform1f(a.u_time,i),t.drawArrays(t.TRIANGLES,0,6),T.frameCount++}var Gr=0;function Bi(e){var t;if(!T)return;if(T.contextLost){T.rafId=0;return}let a=!1;for(let n of T.instances)if(n.visible&&(!n.paused||!n.everCopied)){a=!0;break}if(!a){T.rafId=0;return}if(T.rafId=requestAnimationFrame(Bi),e-Gr<al){if(oa)for(let n of T.glowQueue)n.glowFast&&n.visible&&!n.paused&&(n.glowFast=!!oa(n,e));return}Gr=e,Nl(e),Sl(),T.useOffscreen&&((t=T.frameBitmap)==null||t.close(),T.frameBitmap=T.glCanvas.transferToImageBitmap());for(let n of T.instances)n.visible&&(n.paused&&n.everCopied||(Vo(n),n.everCopied=!0));if(oa&&T.glowQueue.length>0&&++T.glowSkip%rl===0)for(let n of T.glowQueue)n.visible&&!n.paused&&(n.glowFast=!!oa(n,e))}function ho(){!T||T.rafId!==0||(T.rafId=requestAnimationFrame(Bi))}function Oi(){T&&(T.rafId!==0&&cancelAnimationFrame(T.rafId),T.rafId=0)}var An={linear:e=>e,smoothstep:e=>e*e*(3-2*e)};function Za(e,t,a,n=An.linear){return{from:e,to:t,dur:a,ease:n,startMs:-1,val:e,done:!1}}function eo(e,t){e.startMs=t,e.val=e.from,e.done=!1}function Wr(e,t){if(e.done||e.startMs<0)return e.val;let a=Math.min(1,(t-e.startMs)/e.dur);return e.val=e.from+(e.to-e.from)*e.ease(a),a>=1&&(e.done=!0),e.val}var $l=Object.freeze({haloOpMul:2,extraIntensity:3.51,peakOp:.85,baseOp:.34,inset:1.5,extraOutward:1,wanderRange:15,wanderLerp:.0075,fadeRate:.00875,lumLo:.08,lumHi:.32,minDwellMs:1500,relocFadeMs:300,relocFadeOutMs:450,pointGain:2.5,haloHalfLen:7.8,extraHalfLen:9.13952/3,haloStrokeXl:26.4,haloStrokeLg:15.6,haloStrokeMd:7.2,haloStrokeSm:3,haloBlurXl:8.4,haloBlurLg:4.8,haloBlurMd:2.1,haloBlurSm:.9,haloOpXl:.385,haloOpLg:.595,haloOpMd:.7,haloOpSm:.7,extraStrokeOuter:4/3,extraStrokeCore:2/3,extraBlurOuter:2/3,extraBlurCore:1.35/3,extraFadeR:13/3,extraOpOuter:.85}),Y={...$l},Vr=new Set;function Gl(e){return Vr.add(e),()=>{Vr.delete(e)}}var Wl=Object.freeze({enabled:!0,reach:56,fadeMs:200,cursor:!0,cursorDistance:186,cursorStrength:3.35,cursorDiffuse:1.4,cursorFalloff:37,cursorDepth:.4,cursorEdge:0,cursorReach:11.5,cursorBlur:.5,cursorZoom:3,spill:!1,spillRadius:48,spillStrength:.55,spillOffset:.35,spillLumGain:.7,spillSaturation:1.3,spillInside:.5,spillBlur:0,catchLight:!1,catchFollow:.25,catchGain:1}),Ft={...Wl};function Fi(e){Object.assign(Ft,e),!Ft.spill&&ct&&zo(),Ft.cursor||Nt(),$n()}var Ia=null,Fo=null,Yr=0;function Vl(){let e=window.devicePixelRatio||1;return Yr>0?Yr/e:1}function Di(e,t){if(!Qe||!Ia)return;let a=Vl(),n=(e-Ia.hotX*a).toFixed(2),o=(t-Ia.hotY*a).toFixed(2);Qe.style.transform=a===1?`translate3d(${n}px,${o}px,0)`:`translate3d(${n}px,${o}px,0) scale(${a.toFixed(4)})`}var zi=!1,Ui=0,Lo=0,Io=null,Ho={x:0,y:0},Po=null,qr=0;function Yl(e,t,a,n,o){if(Po&&qr===a&&Po.length===n*o)return Po;let i=document.createElement("canvas");i.width=n,i.height=o;let r=i.getContext("2d",{willReadFrequently:!0});if(!r)return null;r.scale(a,a),r.drawImage(e,0,0,t.width,t.height);let d=r.getImageData(0,0,n,o).data,l=new Uint8ClampedArray(n*o);for(let u=0,c=3;u<l.length;u++,c+=4)l[u]=d[c]>=128?255:0;return Po=l,qr=a,l}function Xr(e,t,a,n){let o=e.getImageData(0,0,t,a),i=o.data;for(let r=0,d=0,l=3;r<a;r++)for(let u=0;u<t;u++,d++,l+=4){let c=i[l];if(c===0)continue;let s=n(u,r,d);i[l]=s>=1?c:s<=0?0:c*s}e.putImageData(o,0,0)}function ql(e,t){if(!Io)return 0;let a=-1/0;for(let n=0;n<Io.length;n+=2){let o=Io[n]*e+Io[n+1]*t;o>a&&(a=o)}return a===-1/0?0:a}var oo=0,Oa=!1,na=0,_n=0,lt=Number.NaN,Dt=Number.NaN,io=0,so=0,ta=0,aa=0,Se=null,de={d:0,nx:0,ny:0,k:1,left:0,top:0},yn={x:0,y:0},yt={r:255,g:255,b:255},ct=null,Ln="",In=-1,Hn=-1,lo=!1;function Xl(){oo++,Ql()}function jl(){oo=Math.max(0,oo-1),oo===0&&Jl()}var to=e=>typeof window.matchMedia=="function"&&window.matchMedia(e).matches;function jr(){if(zi||performance.now()<Ui||!Ia||!Fo||to("(prefers-reduced-motion: reduce)")||to("(forced-colors: active)")||!to("(pointer: fine)")||!to("(hover: hover)"))return!1;let e=window.visualViewport;return!(e&&Math.abs(e.scale-1)>.001)}function Ql(){Oa||oo===0||typeof document>"u"||to("(pointer: fine)")&&(Oa=!0,document.addEventListener("pointermove",Ni,{passive:!0}),document.addEventListener("pointerleave",zt),document.addEventListener("pointercancel",zt),document.addEventListener("keydown",$i,{passive:!0}),document.addEventListener("visibilitychange",zt),window.addEventListener("blur",zt))}function Jl(){Oa&&(Oa=!1,document.removeEventListener("pointermove",Ni),document.removeEventListener("pointerleave",zt),document.removeEventListener("pointercancel",zt),document.removeEventListener("keydown",$i),document.removeEventListener("visibilitychange",zt),window.removeEventListener("blur",zt),na!==0&&(cancelAnimationFrame(na),na=0),Se&&(Se.cursorLight=null,Se=null),ta=0,aa=0,ct&&(ct.remove(),ct=null,Ln="",In=-1,Hn=-1,lo=!1),Nt(),Qe&&(Qe.remove(),Qe=null))}var Pn=!0,Nn=!1;function Ni(e){Pn=e.pointerType==="mouse"||e.pointerType==="",Nn=!1,lt=io=e.clientX,Dt=so=e.clientY,co&&Qe&&(Pn&&Gi(lt,Dt)?Di(lt,Dt):Nt()),$n()}function $i(){Nn=!0,Nt()}function zt(){lt=Dt=Number.NaN,$n()}function $n(){!Oa||na!==0||(_n=performance.now(),na=requestAnimationFrame(Wi))}function Kl(e,t,a,n,o,i,r){let d=i==="circle"?Math.min(a,n)/2:Math.max(0,Math.min(o,Math.min(a,n)/2)),l=a/2,u=n/2,c=Math.max(0,a/2-d),s=Math.max(0,n/2-d),p=Math.max(-c,Math.min(c,e-l)),h=Math.max(-s,Math.min(s,t-u)),f=e-l-p,g=t-u-h,b=Math.hypot(f,g);if(b>1e-6)return r.x=l+p+f/b*d,r.y=u+h+g/b*d,b-d;let M=e,x=a-e,m=t,y=n-t,v=Math.min(M,x,m,y);return v===M?(r.x=0,r.y=t):v===x?(r.x=a,r.y=t):v===m?(r.x=e,r.y=0):(r.x=e,r.y=n),-v}var Qe=null,Bt=null,Bn=null,$e=null,ao=null,Qr=!1,Jr=0,Kr=0,Zr=0,co=!1,La=!1,On="",Mt=null,no="",Zl=/^(INPUT|TEXTAREA|SELECT)$/,Fn=new WeakMap,ei=0,Dn=null;function ec(e){let t=e;for(;t&&t!==document.body;){if(Zl.test(t.tagName)||t.isContentEditable)return!0;t=t.parentElement}return!1}function tc(){if(Qe)return!0;let e=document.createElement("div");e.className="metal-fx-cursor",e.setAttribute("aria-hidden","true"),e.style.cssText="position:fixed;left:0;top:0;pointer-events:none;z-index:2147483001;will-change:transform;transform-origin:0 0;display:none";let t=document.createElement("canvas");t.style.display="block",e.appendChild(t),document.body.appendChild(e);let a=t.getContext("2d"),n=document.createElement("canvas"),o=n.getContext("2d");return!a||!o?(e.remove(),!1):(Qe=e,Bt=t,Bn=a,$e=n,ao=o,!0)}function Gi(e,t,a=!1){let n=performance.now();if(!a&&La&&n-ei<12)return!0;ei=n;let o=document.elementFromPoint(e,t);if(!o)return zn(),!1;if(o===Dn&&La)return!0;Dn=o;let i=Fn.get(o);if(i===void 0){if(i=!ec(o),i){let r=getComputedStyle(o).cursor;i=r==="auto"||r==="default"||r==="none"}Fn.set(o,i)}if(!i)return zn(),!1;if(!La){let r=document.documentElement;On=r.style.cursor,r.style.cursor="none",La=!0}return o!==Mt&&(Mt&&(Mt.style.cursor=no,Mt=null,no=""),getComputedStyle(o).cursor!=="none"&&(Mt=o,no=o.style.cursor,o.style.cursor="none")),!0}function zn(){Mt&&(Mt.isConnected&&(Mt.style.cursor=no),Mt=null,no=""),La&&(document.documentElement.style.cursor=On,La=!1,On=""),Dn=null,Fn=new WeakMap}function Nt(){zn(),Qe&&co&&(Qe.style.display="none",co=!1)}function ac(e,t,a){if(!Bn||!ao||!Bt||!$e||!Qe||!Ia||!Fo)return;let n=Ia,o=Math.min(3,window.devicePixelRatio||1);if((o!==Jr||n.width!==Kr||n.height!==Zr)&&(Jr=o,Kr=n.width,Zr=n.height,Bt.width=$e.width=Math.ceil(n.width*o),Bt.height=$e.height=Math.ceil(n.height*o),Bt.style.width=`${n.width}px`,Bt.style.height=`${n.height}px`),!Qr&&(ao=$e.getContext("2d",{willReadFrequently:!0}),Qr=!0,!ao))return;let i=Bn,r=ao,d=n.width,l=n.height;i.setTransform(1,0,0,1,0,0),i.clearRect(0,0,Bt.width,Bt.height),i.scale(o,o),i.drawImage(Fo,0,0,d,l);let u=de.left+de.nx*de.k,c=de.top+de.ny*de.k,s=io-n.hotX+Ho.x,p=so-n.hotY+Ho.y,h=u-s,f=c-p,g=Math.hypot(h,f),b=g>.01?h/g:1,M=g>.01?f/g:0,x=ql(b,M)+t.cursorEdge,m=Math.max(0,g-x),y=Math.max(1,t.cursorFalloff),v=1/(1+m/y*(m/y)),L=e.cssWidth/2,k=e.cssHeight/2,A=L-de.nx,S=k-de.ny,H=Math.hypot(A,S)||1,E=e.mask?0:e.ringCssPx*.5+1,_=de.nx+A/H*E,w=de.ny+S/H*E,I=Cl(e,_,w,4),O=I.lum,F=I.r,D=I.g,B=I.b,U=t.cursorStrength*v*a,R=t.cursorDiffuse*v*(.5+.5*Math.min(1,O/.5))*a;if(g>.01&&U+R>.005){let N=h/g,Q=f/g,$=Math.atan2(Q,N),V=Math.max(.1,Math.min(1,t.cursorDepth)),Z=Ho.x+x*N,ee=Ho.y+x*Q,ne=Math.max(1,t.cursorReach);if(r.setTransform(1,0,0,1,0,0),r.clearRect(0,0,$e.width,$e.height),r.scale(o,o),U>.005){r.save(),r.filter=t.cursorBlur>0?`blur(${t.cursorBlur}px)`:"none";let C=Math.max(1,t.cursorZoom);r.translate(Z,ee),r.rotate($),r.scale(-1,1),r.translate((g-x)*V,0),r.rotate(-$),r.scale(C,C);let J=e.overscan,re=de.k,ae=Math.max(1,Math.ceil(U));r.globalAlpha=Math.min(1,U/ae),r.globalCompositeOperation="lighter";let le=e.mask&&e.rawCanvas?e.rawCanvas:e.canvas;for(let oe=0;oe<ae;oe++)r.drawImage(le,-(de.nx+J)*re,-(de.ny+J)*re,(e.cssWidth+2*J)*re,(e.cssHeight+2*J)*re);r.restore();let ie=1/o,q=1/ne;Xr(r,$e.width,$e.height,(oe,X)=>{let me=-(((oe+.5)*ie-Z)*N+((X+.5)*ie-ee)*Q);return me<=0?1:1-me*q})}if(R>.005){let C=Math.max(F,D,B)||1,J=Math.round(F*255/C),re=Math.round(D*255/C),ae=Math.round(B*255/C),le=ne*1.2,ie=r.createLinearGradient(Z+.5*N,ee+.5*Q,Z-le*N,ee-le*Q),q=Math.min(1,R);ie.addColorStop(0,`rgba(${J},${re},${ae},${q.toFixed(3)})`),ie.addColorStop(.45,`rgba(${J},${re},${ae},${(q*.4).toFixed(3)})`),ie.addColorStop(1,`rgba(${J},${re},${ae},0)`),r.globalCompositeOperation="lighter",r.fillStyle=ie,r.fillRect(0,0,d,l),r.globalCompositeOperation="source-over"}let Re=Yl(Fo,n,o,$e.width,$e.height);Re&&Xr(r,$e.width,$e.height,(C,J,re)=>Re[re]===0?0:1),i.globalCompositeOperation="lighter",i.drawImage($e,0,0,d,l),i.globalCompositeOperation="source-over"}Di(io,so),co||(Qe.style.display="",co=!0)}function oc(){if(ct)return ct;let e=document.createElement("div");return e.className="metal-fx-cursor-spill",e.setAttribute("aria-hidden","true"),e.style.cssText="position:fixed;left:0;top:0;pointer-events:none;z-index:2147483000;border-radius:50%;mix-blend-mode:plus-lighter;will-change:transform,opacity;opacity:0;display:none",document.body.appendChild(e),ct=e,e}function zo(){!ct||!lo||(ct.style.display="none",ct.style.opacity="0",lo=!1)}function Wi(e){if(na=0,!Oa)return;let t=performance.now();try{nc(e)}catch(a){zi=!0,Nt(),zo(),Se&&(Se.cursorLight=null,Se=null),typeof console<"u"&&console.warn("metal-fx: cursor light disabled after error",a);return}performance.now()-t>6?++Lo>=20&&(Lo=0,Ui=performance.now()+5e3,Nt()):Lo>0&&Lo--}function nc(e){let t=Ft,a=Math.min(.05,Math.max(.001,(e-_n)/1e3));_n=e;let n=null,o=0,i=0;if(t.enabled&&T&&!Number.isNaN(lt)){let d=Number.POSITIVE_INFINITY,l=Math.max(1,t.reach),u=t.cursor&&jr()?Math.max(1,t.cursorDistance):0,c=Math.max(l,u);for(let s of T.instances){if(!s.visible||!s.canvas.isConnected)continue;let p=s.canvas.getBoundingClientRect();if(p.width<=0)continue;let h=s.overscan,f=p.width/(s.cssWidth+2*h),g=p.left+h*f,b=p.top+h*f,M=c*f;if(lt<g-M||lt>g+s.cssWidth*f+M||Dt<b-M||Dt>b+s.cssHeight*f+M)continue;let x=(lt-g)/f,m=(Dt-b)/f,y=Kl(x,m,s.cssWidth,s.cssHeight,s.cornerRadius,s.kind,yn),v=Math.abs(y);v<=c&&v<d&&(d=v,n=s,de.d=y,de.nx=yn.x,de.ny=yn.y,de.k=f,de.left=g,de.top=b)}if(n){if(d<=l){let s=1-d/l;o=s*s*(3-2*s)}d<=u&&(i=Math.min(1,(1-d/u)*3)),n.mask&&(de.nx=n.cssWidth/2,de.ny=n.cssHeight/2,n.wantRaw=!0)}}let r=1-Math.exp(-(a*1e3)/(Math.max(1,t.fadeMs)/3));if(ta+=(o-ta)*r,aa+=(i-aa)*r,n&&n!==Se&&(Se&&(Se.cursorLight=null,xn(Se,e)),Se=n),!n&&ta<.002&&aa<.002){ta=0,aa=0,Se&&(Se.cursorLight=null,xn(Se,e),Se=null),zo(),Nt();return}if(Se){if(t.catchLight){let d=Se.cursorLight??(Se.cursorLight={x:0,y:0,w:0});d.x=de.nx,d.y=de.ny,d.w=ta}else Se.cursorLight&&(Se.cursorLight=null);if(xn(Se,e),t.cursor&&aa>.002&&Pn&&!Nn&&!Number.isNaN(lt)&&jr()&&tc()&&Gi(lt,Dt)?ac(Se,t,aa):Nt(),t.spill){let d=oc(),l=Ii(Se,de.nx,de.ny,2),u=kn(Se,de.nx,de.ny,3),c=Math.max(l.r,l.g,l.b)||1,s=Ei(l.r*255/c,l.g*255/c,l.b*255/c),[p,h,f]=Ri(s[0],Math.min(1,s[1]*t.spillSaturation),1);yt.r+=(p-yt.r)*.15,yt.g+=(h-yt.g)*.15,yt.b+=(f-yt.b)*.15;let g=Math.round(yt.r/6)*6,b=Math.round(yt.g/6)*6,M=Math.round(yt.b/6)*6,x=`radial-gradient(closest-side, rgba(${g},${b},${M},1) 0%, rgba(${g},${b},${M},0.35) 45%, rgba(${g},${b},${M},0) 100%)`;x!==Ln&&(Ln=x,d.style.background=x);let m=Math.max(1,t.spillRadius*de.k);m!==In&&(In=m,d.style.width=`${(2*m).toFixed(1)}px`,d.style.height=`${(2*m).toFixed(1)}px`),t.spillBlur!==Hn&&(Hn=t.spillBlur,d.style.filter=t.spillBlur>0?`blur(${t.spillBlur}px)`:"");let y=de.left+de.nx*de.k,v=de.top+de.ny*de.k,L=io+(y-io)*t.spillOffset,k=so+(v-so)*t.spillOffset;d.style.transform=`translate3d(${(L-m).toFixed(2)}px,${(k-m).toFixed(2)}px,0)`;let A=Math.min(1,Math.max(0,u/.3)),S=1-t.spillLumGain+t.spillLumGain*A,H=de.d<0?t.spillInside:1,E=Math.max(0,Math.min(1,t.spillStrength*ta*S*H));lo||(d.style.display="",lo=!0),d.style.opacity=E.toFixed(3)}else zo();na=requestAnimationFrame(Wi)}}var Uo=new Map;function rc(e,t){let a=Math.sqrt(12*e*e/t+1),n=Math.floor(a);n%2===0&&n--;let o=n+2,i=(12*e*e-t*n*n-4*t*n-3*t)/(-4*n-4),r=Math.round(i),d=[];for(let l=0;l<t;l++)d.push(l<r?n:o);return d}function ic(e,t,a,n,o){let i=1/(o+o+1);for(let r=0;r<n;r++){let d=r*a,l=0;for(let u=-o;u<=o;u++)l+=e[d+Math.min(a-1,Math.max(0,u))];for(let u=0;u<a;u++){t[d+u]=l*i;let c=d+Math.max(0,u-o),s=d+Math.min(a-1,u+o+1);l+=e[s]-e[c]}}}function sc(e,t,a,n,o){let i=1/(o+o+1);for(let r=0;r<a;r++){let d=0;for(let l=-o;l<=o;l++)d+=e[Math.min(n-1,Math.max(0,l))*a+r];for(let l=0;l<n;l++){t[l*a+r]=d*i;let u=Math.max(0,l-o)*a+r,c=Math.min(n-1,l+o+1)*a+r;d+=e[c]-e[u]}}}function Gn(e,t,a,n){if(n<=.05)return e;let o=new Float32Array(e.length),i=e;for(let r of rc(n,3)){let d=(r-1)/2;ic(i,o,t,a,d),sc(o,i,t,a,d)}return i}function lc(e,t,a,n,o,i,r){let d=document.createElement("canvas");d.width=a,d.height=n;let l=d.getContext("2d",{willReadFrequently:!0}),u=new Float32Array(a*n);if(!l)return u;l.scale(o,o),l.strokeStyle="#fff",l.lineCap="round",l.lineJoin="round",l.lineWidth=t,l.beginPath(),l.moveTo(i-e,r),l.lineTo(i+e,r),l.stroke();let c=l.getImageData(0,0,a,n).data;for(let s=0,p=3;s<u.length;s++,p+=4)u[s]=c[p]/255;return u}function Vi(e,t,a,n,o){let i=0;for(let g of e)i=Math.max(i,(g.stroke/2+3*g.blur)*a);let r=Math.ceil(i)+1,d=2*t+2*r,l=2*r,u=Math.ceil(d*n),c=Math.ceil(l*n),s=new Float32Array(u*c);for(let g of e){let b=lc(t,g.stroke*a,u,c,n,r,r);b=Gn(b,u,c,g.blur*a*n);let M=g.opacity;for(let x=0;x<s.length;x++){let m=b[x]*M;s[x]=s[x]+m*(1-s[x])}}if(o>0){let g=r*n,b=r*n,M=o*a*n;for(let x=0;x<c;x++)for(let m=0;m<u;m++){let y=Math.hypot(m+.5-g,x+.5-b)/M,v;y<=.3?v=1:y<=.65?v=1-(y-.3)/.35*.75:y<1?v=.25*(1-(y-.65)/.35):v=0,s[x*u+m]*=v}}let p=document.createElement("canvas");p.width=u,p.height=c;let h=p.getContext("2d"),f=new Uint8ClampedArray(u*c);for(let g=0;g<s.length;g++)f[g]=Math.round(Math.min(1,s[g])*255);if(h){let g=h.createImageData(u,c),b=g.data;for(let M=0,x=0;M<s.length;M++,x+=4)b[x]=255,b[x+1]=255,b[x+2]=255,b[x+3]=f[M];h.putImageData(g,0,0)}return{canvas:p,alpha:f,w:d,h:l,ax:r,ay:r}}function Yi(){return[Y.haloStrokeXl,Y.haloStrokeLg,Y.haloStrokeMd,Y.haloStrokeSm,Y.haloBlurXl,Y.haloBlurLg,Y.haloBlurMd,Y.haloBlurSm,Y.haloOpXl,Y.haloOpLg,Y.haloOpMd,Y.haloOpSm,Y.extraStrokeOuter,Y.extraStrokeCore,Y.extraBlurOuter,Y.extraBlurCore,Y.extraFadeR,Y.extraOpOuter].join(",")}function cc(e,t,a){let n=`h|${e.toFixed(2)}|${t}|${a}|${Yi()}`,o=Uo.get(n);return o||(o=Vi([{stroke:Y.haloStrokeXl,blur:Y.haloBlurXl,opacity:Y.haloOpXl},{stroke:Y.haloStrokeLg,blur:Y.haloBlurLg,opacity:Y.haloOpLg},{stroke:Y.haloStrokeMd,blur:Y.haloBlurMd,opacity:Y.haloOpMd},{stroke:Y.haloStrokeSm,blur:Y.haloBlurSm,opacity:Y.haloOpSm}],e,t,a,0),Uo.set(n,o)),o}function dc(e,t,a){let n=`e|${e.toFixed(2)}|${t}|${a}|${Yi()}`,o=Uo.get(n);return o||(o=Vi([{stroke:Y.extraStrokeOuter,blur:Y.extraBlurOuter,opacity:Y.extraOpOuter},{stroke:Y.extraStrokeCore,blur:Y.extraBlurCore,opacity:1}],e,t,a,Y.extraFadeR),Uo.set(n,o)),o}function ti(e,t,a,n,o){var i;let r=t<<16|a<<8|n;if(o.canvas&&o.tint===r&&o.src===e)return o.canvas;let d=o.canvas,l=o.img;(!d||!l||o.src!==e)&&(d=document.createElement("canvas"),d.width=e.canvas.width,d.height=e.canvas.height,l=((i=d.getContext("2d"))==null?void 0:i.createImageData(d.width,d.height))??null);let u=d.getContext("2d");if(u&&l){let c=l.data,s=e.alpha;for(let p=0,h=0;p<s.length;p++,h+=4)c[h]=t,c[h+1]=a,c[h+2]=n,c[h+3]=s[p];u.putImageData(l,0,0)}return o.canvas=d,o.img=l,o.tint=r,o.src=e,d}function Wn(e,t,a){let n=Math.max(0,Math.min(a,Math.min(e,t)/2));return 2*Math.max(0,e-2*n)+2*Math.max(0,t-2*n)+2*Math.PI*n}function No(e,t,a,n){return n==="circle"?2*Math.PI*Math.max(0,Math.min(a,Math.min(e,t)/2)):Wn(e,t,a)}function uo(e,t,a,n,o,i,r,d){let l=d||{x:0,y:0},u=Math.max(0,Math.min(n,Math.min(t,a)/2));if(r==="circle"){let M=2*Math.PI*u;if(M<=1e-4)return l.x=t*.5,l.y=a*.5,l;e=(e%M+M)%M;let x=-Math.PI/2+e/M*Math.PI*2,m=Math.max(0,u-o+i);return l.x=t*.5+m*Math.cos(x),l.y=a*.5+m*Math.sin(x),l}let c=Math.max(0,t-2*u),s=Math.max(0,a-2*u),p=Math.PI*u/2,h=2*(c+s)+4*p;e=(e%h+h)%h;let f=Math.max(0,u-o+i),g=e;if(g<c)return l.x=u+g,l.y=o-i,l;if(g-=c,g<p){let M=-Math.PI/2+(p>0?g/p:0)*(Math.PI/2);return l.x=t-u+f*Math.cos(M),l.y=u+f*Math.sin(M),l}if(g-=p,g<s)return l.x=t-o+i,l.y=u+g,l;if(g-=s,g<p){let M=(p>0?g/p:0)*(Math.PI/2);return l.x=t-u+f*Math.cos(M),l.y=a-u+f*Math.sin(M),l}if(g-=p,g<c)return l.x=t-u-g,l.y=a-o+i,l;if(g-=c,g<p){let M=Math.PI/2+(p>0?g/p:0)*(Math.PI/2);return l.x=u+f*Math.cos(M),l.y=a-u+f*Math.sin(M),l}if(g-=p,g<s)return l.x=o-i,l.y=a-u-g,l;g-=s;let b=Math.PI+(p>0?g/p:0)*(Math.PI/2);return l.x=u+f*Math.cos(b),l.y=u+f*Math.sin(b),l}function uc(e,t,a,n,o,i){let r=Math.max(0,Math.min(o,Math.min(a,n)/2));if(i==="circle"){let v=2*Math.PI*r;return v<=1e-4?0:((Math.atan2(t-n/2,e-a/2)+Math.PI/2)/(2*Math.PI)*v%v+v)%v}let d=Math.max(0,a-2*r),l=Math.max(0,n-2*r),u=Math.PI*r/2,c=Math.PI/2,s=d,p=s+u,h=p+l,f=h+u,g=f+d,b=g+u,M=b+l,x=e>=r&&e<=a-r,m=t>=r&&t<=n-r;if(x&&m){let v=e,L=a-e,k=t,A=n-t,S=Math.min(v,L,k,A);return S===k?e-r:S===L?p+(t-r):S===A?f+(a-r-e):b+(n-r-t)}if(x)return t<n/2?e-r:f+(a-r-e);if(m)return e>a/2?p+(t-r):b+(n-r-t);if(e>a/2&&t<n/2){let v=Math.atan2(t-r,e-(a-r));return s+(v+c)/c*u}if(e>a/2){let v=Math.atan2(t-(n-r),e-(a-r));return h+v/c*u}if(t>n/2){let v=Math.atan2(t-(n-r),e-r);return g+(v-c)/c*u}let y=Math.atan2(t-r,e-r);return M+(y+Math.PI)/c*u}var wn={x:0,y:0},bn={x:0,y:0};function hc(e,t,a,n,o,i){return uo(e-.1,t,a,n,o,0,i,wn),uo(e+.1,t,a,n,o,0,i,bn),Math.atan2(bn.y-wn.y,bn.x-wn.x)}function ai(e,t,a){if(e===t)return a<e?0:1;let n=Math.max(0,Math.min(1,(a-e)/(t-e)));return n*n*(3-2*n)}function pc(e){if(e.samplePoints&&e.samplePoints.length>0)return e.samplePoints.map((o,i)=>({x:o.x,y:o.y,arc:i}));let t=No(e.width,e.height,e.cornerRadius,e.kind),a=Y.inset*(e.scale??1),n=[];for(let o=0;o<Fr;o++){let i=o/Fr*t,r=uo(i,e.width,e.height,e.cornerRadius,a,0,e.kind);n.push({x:r.x,y:r.y,arc:i})}return n}var mc=.05,fc=120*(1e3/15),oi=1e3/15,ni=2e3,Mn=400,gc=2.625,vc=1.008,xc=.31,qi=140,Xi=40,ji=20,yc=34,Bo=.25,wc=.01,ri=.004,bc=.5,Mc=3.5,je={x:0,y:0};function ii(e,t){let{width:a,height:n}=t,o=t.scale??1,i=Math.min(3,typeof window<"u"&&window.devicePixelRatio||1),r=No(a,n,t.cornerRadius,t.kind)/Wn(qi,Xi,ji),d=Math.max(1,Y.haloHalfLen*r),l=Math.max(.6,Y.extraHalfLen*r),u=cc(d,o,i),c=dc(l,o,i),s=Math.ceil(Math.max(u.ay,c.ay)+Y.extraOutward*r*o+2),p=document.createElement("div");p.className="metal-fx-glow-svg",p.setAttribute("aria-hidden","true");let h=document.createElement("div");h.className="metal-fx-glow-env",h.style.cssText="position:absolute;inset:0;pointer-events:none;opacity:0";let f=document.createElement("canvas");f.className="metal-fx-glow-canvas";let g=a+2*s,b=n+2*s;f.width=Math.ceil(g*i),f.height=Math.ceil(b*i),f.style.cssText=`position:absolute;left:${-s}px;top:${-s}px;width:${g}px;height:${b}px;pointer-events:none`,h.appendChild(f),p.appendChild(h),e.appendChild(p);let M=f.getContext("2d",{willReadFrequently:!!t.maskDataUrl});if(!M)throw new Error("metal-fx: glow canvas 2D context unavailable");let x={wrap:p,env:h,canvas:f,ctx:M,surroundPath:null,bandPath:null,maskAlpha:null,maskReady:!1,margin:s,dpr:i,halo:u,extra:c,haloTint:{canvas:null,img:null,tint:-1,src:null},extraTint:{canvas:null,img:null,tint:-1,src:null},mO:Pa(),mI:Pa(),maskSum:Number.NaN,maskDeformed:!1,deform:null,width:a,height:n,cornerRadius:t.cornerRadius,kind:t.kind,scale:o,perim:pc(t),pointMode:!!(t.samplePoints&&t.samplePoints.length>0),currentIdx:0,appearedAt:0,glowOpacity:0,relocTween:null,relocNextIdx:-1,relocMul:0,envClock:0,cursorMode:!1,cursorArc:0,cursorTargetArc:0,lastTickMs:0,wanderS:0,wanderTargetS:0,wanderFrames:0,tintFrom:{r:255,g:255,b:255},tintTarget:{r:255,g:255,b:255},tintTween:null,tintHoldUntil:0,dX:Number.NaN,dY:Number.NaN,dAng:Number.NaN,dEX:Number.NaN,dEY:Number.NaN,dHOp:Number.NaN,dEOp:Number.NaN,dHaloTint:"",dExtraTint:"",dirty:!0,dEnv:-1};if(t.maskDataUrl){let m=new Image;m.onload=()=>{let y=document.createElement("canvas");y.width=f.width,y.height=f.height;let v=y.getContext("2d",{willReadFrequently:!0});if(!v)return;v.scale(i,i),v.drawImage(m,s,s,a,n);let L=v.getImageData(0,0,y.width,y.height).data,k=y.width*y.height,A=new Float32Array(k);for(let w=0,I=3;w<k;w++,I+=4)A[w]=L[I]/255;let S=Gn(Float32Array.from(A),y.width,y.height,Mc*i),H=0;for(let w=0;w<k;w++)S[w]>H&&(H=S[w]);let E=H>0?bc/H:0,_=new Uint8ClampedArray(k);for(let w=0;w<k;w++)_[w]=Math.round(Math.max(A[w],S[w]*E)*255);x.maskAlpha=_,x.maskReady=!0,x.dirty=!0},m.src=t.maskDataUrl}else Un(x,null);return x}function Un(e,t){if(e.pointMode)return;let{margin:a,width:n,height:o,cornerRadius:i}=e,r=e.kind==="circle"?2:1;Ba(0,0,n,o,i,t,e.mO),Ba(r,r,n-2*r,o-2*r,Math.max(0,i-r),t,e.mI);let d=new Path2D;En(d,e.mO,a);let l=new Path2D;En(l,e.mO,a),En(l,e.mI,a);let u=new Path2D;u.rect(0,0,n+2*a,o+2*a),u.addPath(d),e.surroundPath=u,e.bandPath=l,e.maskReady=!0}function En(e,t,a){let n=t.xy;for(let o=0;o<t.n;o++){let i=n[o*2]+a,r=n[o*2+1]+a;o===0?e.moveTo(i,r):e.lineTo(i,r)}e.closePath()}function Ec(e,t){if(!e)return 0;Ba(0,0,t.width,t.height,t.cornerRadius,e,t.mO);let a=0,n=t.mO.xy;for(let o=0;o<t.mO.n;o+=4)a+=n[o*2]*1.37+n[o*2+1];return a}function Rc(e,t){if(e.deform=t,!e.pointMode)if(t){let a=Ec(t,e);a!==e.maskSum&&(e.maskSum=a,Un(e,t),e.maskDeformed=!0,e.dirty=!0)}else e.maskDeformed&&(e.maskSum=Number.NaN,Un(e,null),e.maskDeformed=!1,e.dirty=!0)}function Sc(e,t,a,n,o="dark"){var i;let{width:r,height:d,cornerRadius:l,perim:u}=e;if(u.length===0)return!1;let c=2,s=-1,p=e.currentIdx,h=0;for(let q=0;q<u.length;q++){let oe=u[q],X=kn(t,oe.x,oe.y,c);X>s&&(s=X,p=q),q===e.currentIdx&&(h=X)}let f=e.appearedAt>0&&a-e.appearedAt<Y.minDwellMs,g=Y.baseOp+(Y.peakOp-Y.baseOp)*ai(Y.lumLo,Y.lumHi,h),b=!f&&s-h>mc,M=t.cursorLight,x=Ft.enabled&&Ft.catchLight&&!e.pointMode&&!!M&&M.w>.02,m=No(r,d,l,e.kind);x&&(e.cursorTargetArc=uc(M.x,M.y,r,d,l,e.kind));let y=x?Math.min(1,Y.peakOp*Ft.catchGain*M.w):0,v=e.lastTickMs>0?Math.min(200,Math.max(.5,a-e.lastTickMs)):oi;e.lastTickMs=a,e.envClock+=Math.min(v,yc);let L=q=>1-Math.pow(1-q,v/oi),k=Math.max(1,Y.relocFadeMs),A=Math.max(1,Y.relocFadeOutMs),S=-2,H=-3,E=()=>{e.appearedAt=a,e.wanderS=0,e.wanderTargetS=0,e.wanderFrames=0,e.relocTween=Za(0,1,k,An.smoothstep),eo(e.relocTween,e.envClock)},_=q=>{e.relocNextIdx=q,e.relocTween=Za(1,0,A,An.smoothstep),eo(e.relocTween,e.envClock)};if((i=e.relocTween)!=null&&i.done&&e.relocTween.to===0){let q=e.relocNextIdx;if(q===S&&!x&&(q=H),q===H)e.cursorMode=!1,e.appearedAt=0,e.relocTween=null;else if(q===S)e.cursorMode=!0,e.cursorArc=e.cursorTargetArc,e.glowOpacity=y,E();else{e.currentIdx=q;let oe=u[e.currentIdx],X=kn(t,oe.x,oe.y,c);e.glowOpacity=Y.baseOp+(Y.peakOp-Y.baseOp)*ai(Y.lumLo,Y.lumHi,X),E()}}if((!e.relocTween||e.relocTween.done)&&(e.appearedAt===0?(x?(e.cursorMode=!0,e.cursorArc=e.cursorTargetArc,e.glowOpacity=y):(e.cursorMode=!1,e.currentIdx=p,e.glowOpacity=g),E()):x!==e.cursorMode?_(x?S:H):!e.cursorMode&&b&&_(p)),e.cursorMode){x&&(e.glowOpacity=y);let q=Math.max(.01,Math.min(1,Ft.catchFollow)),oe=1-Math.pow(1-q,v/(1e3/60)),X=e.cursorTargetArc-e.cursorArc;X=(X%m+m*1.5)%m-m/2,e.cursorArc+=X*oe}else e.glowOpacity+=(g-e.glowOpacity)*L(Y.fadeRate);e.glowOpacity=Math.max(0,Math.min(1,e.glowOpacity)),e.relocMul=e.relocTween?Wr(e.relocTween,e.envClock):1;let w=No(r,d,l,e.kind)/Wn(qi,Xi,ji),I=Y.wanderRange*w;e.wanderFrames+=v,e.wanderFrames>=fc&&(e.wanderTargetS=(Math.random()*2-1)*I,e.wanderFrames=0),e.wanderS+=(e.wanderTargetS-e.wanderS)*L(Y.wanderLerp);let O,F,D,B,U;if(e.pointMode){let q=u[e.currentIdx];O=q.x+e.wanderS,F=q.y,D=0,B=O,U=F}else{let q=e.cursorMode?e.cursorArc:u[e.currentIdx].arc+e.wanderS,oe=Y.inset*e.scale;uo(q,r,d,l,oe,0,e.kind,je),O=je.x,F=je.y,D=hc(q,r,d,l,oe,e.kind);let X=Y.extraOutward*w*e.scale;uo(q,r,d,l,oe,X,e.kind,je),B=je.x,U=je.y}e.deform&&(e.deform(O,F,je),O=je.x,F=je.y,e.deform(B,U,je),B=je.x,U=je.y);let R=o==="light",N=R?Tl(t,O,F,c):Ii(t,O,F,c);e.tintTween?e.tintTween.done&&(R?(e.tintFrom={r:e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*e.tintTween.val,g:e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*e.tintTween.val,b:e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*e.tintTween.val},e.tintTarget={...N},e.tintTween=Za(0,1,Mn),eo(e.tintTween,a)):a>=e.tintHoldUntil&&(e.tintFrom={...e.tintTarget},e.tintTarget={...N},e.tintTween=Za(0,1,Mn),eo(e.tintTween,a),e.tintHoldUntil=a+ni)):(e.tintFrom={...N},e.tintTarget={...N},e.tintTween=Za(0,1,Mn),eo(e.tintTween,a),e.tintHoldUntil=R?0:a+ni),Wr(e.tintTween,a);let Q=e.tintTween.val,$,V,Z;if(R)$=Math.round(e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*Q),V=Math.round(e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*Q),Z=Math.round(e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*Q);else{let q=e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*Q,oe=e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*Q,X=e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*Q,me=Math.max(q,oe,X)||1;$=Math.round(255*(q/me)),V=Math.round(255*(oe/me)),Z=Math.round(255*(X/me))}let ee=`rgb(${$},${V},${Z})`,ne="#ffffff";if(R){let q=Ei($,V,Z),[oe,X,me]=Ri(q[0],Math.min(1,q[1]*gc),Math.max(xc,q[2]*vc));ne=`rgb(${oe},${X},${me})`}let Re=Math.max(0,Math.min(1,n))*(e.pointMode?Y.pointGain:1),C=Math.min(1,e.glowOpacity*Y.haloOpMul*Re),J=Math.min(1,e.glowOpacity*Y.extraIntensity*Re);if(Math.abs(e.relocMul-e.dEnv)>.002){let q=e.relocMul>=.998&&e.dEnv<.998;e.dEnv=e.relocMul,e.env.style.opacity=e.relocMul.toFixed(3),q&&(e.dirty=!0)}let re=!!(e.relocTween&&!e.relocTween.done)||e.cursorMode,ae=!(Math.abs(O-e.dX)<Bo&&Math.abs(F-e.dY)<Bo&&Math.abs(D-e.dAng)<wc&&Math.abs(B-e.dEX)<Bo&&Math.abs(U-e.dEY)<Bo),le=!(Math.abs(C-e.dHOp)<ri&&Math.abs(J-e.dEOp)<ri),ie=ee!==e.dHaloTint||ne!==e.dExtraTint;return(e.dirty||ae||le||ie)&&(e.dX=O,e.dY=F,e.dAng=D,e.dEX=B,e.dEY=U,e.dHOp=C,e.dEOp=J,e.dHaloTint=ee,e.dExtraTint=ne,e.dirty=!1,Tc(e,O,F,D,B,U,C,J,ee,ne)),re}function Tc(e,t,a,n,o,i,r,d,l,u){let{ctx:c,canvas:s,dpr:p,margin:h}=e;if(c.setTransform(1,0,0,1,0,0),c.globalCompositeOperation="source-over",c.globalAlpha=1,c.clearRect(0,0,s.width,s.height),r<=.002&&d<=.002||!e.maskReady)return;let f=r>.002?ti(e.halo,...si(l),e.haloTint):null,g=d>.002?u==="#ffffff"?e.extra.canvas:ti(e.extra,...si(u),e.extraTint):null,b=y=>{f&&(c.save(),c.translate(t+h,a+h),c.rotate(n),c.globalAlpha=r*y,c.drawImage(f,-e.halo.ax,-e.halo.ay,e.halo.w,e.halo.h),c.restore()),g&&(c.save(),c.translate(o+h,i+h),c.rotate(n),c.globalAlpha=d*y,c.drawImage(g,-e.extra.ax,-e.extra.ay,e.extra.w,e.extra.h),c.restore())};if(!e.pointMode&&e.surroundPath&&e.bandPath){c.save(),c.scale(p,p),c.clip(e.surroundPath,"evenodd"),b(.5),c.restore(),c.save(),c.scale(p,p),c.clip(e.bandPath,"evenodd"),b(1),c.restore();return}c.save(),c.scale(p,p),b(1),c.restore();let M=e.maskAlpha;if(!M)return;let x=c.getImageData(0,0,s.width,s.height),m=x.data;for(let y=0,v=3;y<M.length;y++,v+=4){let L=M[y];if(L!==255){if(L===0){m[v]=0;continue}m[v]=(m[v]*L+127)/255}}c.putImageData(x,0,0)}var Ca=[255,255,255];function si(e){if(e[0]==="#")return Ca[0]=parseInt(e.slice(1,3),16),Ca[1]=parseInt(e.slice(3,5),16),Ca[2]=parseInt(e.slice(5,7),16),Ca;let t=4,a=0,n=0;for(;t<e.length&&n<3;){let o=e.charCodeAt(t++);o>=48&&o<=57?a=a*10+(o-48):(o===44||o===41)&&(Ca[n++]=a,a=0)}return Ca}function Cc(e,t){e.pointMode===t.pointMode&&(t.currentIdx=Math.min(e.currentIdx,Math.max(0,t.perim.length-1)),t.appearedAt=e.appearedAt,t.glowOpacity=e.glowOpacity,t.relocTween=e.relocTween,t.relocNextIdx=e.relocNextIdx,t.relocMul=e.relocMul,t.envClock=e.envClock,t.cursorMode=e.cursorMode,t.cursorArc=e.cursorArc,t.cursorTargetArc=e.cursorTargetArc,t.lastTickMs=e.lastTickMs,t.wanderS=e.wanderS,t.wanderTargetS=e.wanderTargetS,t.wanderFrames=e.wanderFrames,t.tintFrom=e.tintFrom,t.tintTarget=e.tintTarget,t.tintTween=e.tintTween,t.tintHoldUntil=e.tintHoldUntil,t.dEnv=e.relocMul,t.env.style.opacity=e.relocMul.toFixed(3))}var li=Object.freeze({offsetY:1,blur:.5,alpha:.9,color:"#ffffff"});function kc(e,t,a){let n=Math.min(3,typeof window<"u"&&window.devicePixelRatio||1),o=Math.ceil(3*a.blur+Math.abs(a.offsetY)+1),i=t.width+2*o,r=t.height+2*o,d=document.createElement("canvas");d.className="metal-fx-rim-canvas",d.setAttribute("aria-hidden","true"),d.width=Math.ceil(i*n),d.height=Math.ceil(r*n),d.style.cssText=`position:absolute;left:${-o}px;top:${-o}px;width:${i}px;height:${r}px;pointer-events:none`;let l=d.getContext("2d"),u=document.createElement("canvas");u.width=d.width,u.height=d.height;let c=u.getContext("2d",{willReadFrequently:!0});if(!l||!c)return null;e.appendChild(d);let s={canvas:d,ctx:l,scratch:u,sctx:c,width:t.width,height:t.height,cornerRadius:t.cornerRadius,kind:t.kind,ring:t.ring,margin:o,dpr:n,opts:a,mO:Pa(),mI:Pa(),sum:Number.NaN};return Qi(s,null,!0),s}function ci(e,t,a){let n=t.xy;for(let o=0;o<t.n;o++){let i=n[o*2]+a,r=n[o*2+1]+a;o===0?e.moveTo(i,r):e.lineTo(i,r)}e.closePath()}function Qi(e,t,a=!1){let{width:n,height:o,cornerRadius:i,ring:r,margin:d,dpr:l}=e;Ba(0,0,n,o,i,t,e.mO),Ba(r,r,n-2*r,o-2*r,Math.max(0,i-r),t,e.mI);let u=0,c=e.mO.xy;for(let w=0;w<e.mO.n;w+=4)u+=c[w*2]*1.37+c[w*2+1];if(!a&&u===e.sum)return;e.sum=u;let{sctx:s,scratch:p,ctx:h,canvas:f,opts:g}=e,b=p.width,M=p.height;s.setTransform(1,0,0,1,0,0),s.clearRect(0,0,b,M),s.scale(l,l),s.fillStyle="#fff",s.beginPath(),ci(s,e.mO,d),ci(s,e.mI,d),s.fill("evenodd");let x=s.getImageData(0,0,b,M).data,m=b*M,y=new Float32Array(m);for(let w=0,I=3;w<m;w++,I+=4)y[w]=x[I]/255;let v=Math.round(g.offsetY*l)*b,L=new Float32Array(m);if(v>=0)for(let w=0;w<m;w++)L[w]=Math.max(0,y[w]-(w>=v?y[w-v]:0));else for(let w=0;w<m;w++)L[w]=Math.max(0,y[w]-(w-v<m?y[w-v]:0));let k=Gn(L,b,M,g.blur*l),A=parseInt(g.color.slice(1,3),16),S=parseInt(g.color.slice(3,5),16),H=parseInt(g.color.slice(5,7),16),E=h.createImageData(b,M),_=E.data;for(let w=0,I=0;w<m;w++,I+=4)_[I]=A,_[I+1]=S,_[I+2]=H,_[I+3]=Math.round(Math.min(1,k[w]*y[w]*g.alpha)*255);h.setTransform(1,0,0,1,0,0),h.putImageData(E,0,0)}function di(e){e&&e.canvas.remove()}var Do=12,ui=32,hi=1,pi=.55,Ac=1,_c=1,Lc=.85,Ic=0,Hc=1.3,mi=3.6,Pc=.7,Bc=1,Oc=.52,Fc=1,Dc=.044,zc=235,Uc=2.535,fi=.7,Nc=.5,$c=new Set(["INPUT","TEXTAREA","SELECT","OPTION"]);function Gc(e,t){let a=Math.max(e.left-t.right,t.left-e.right,0),n=Math.max(e.top-t.bottom,t.top-e.bottom,0);return Math.sqrt(a*a+n*n)}function Wc(e,t,a,n){return!(Math.min(e.bottom,t.bottom)-Math.max(e.top,t.top)<a||Math.max(e.left-t.right,t.left-e.right,0)>n)}function Vc(e,t,a,n){return Math.min(e.right,t.right)-Math.max(e.left,t.left)<a?!1:Math.max(e.top-t.bottom,t.top-e.bottom,0)<=n}function ra(e,t,a,n,o,i){let r=Math.max(0,Math.min(i,n*.5,o*.5)),d=e.roundRect;if(typeof d=="function"){d.call(e,t,a,n,o,r);return}e.moveTo(t+r,a),e.lineTo(t+n-r,a),e.quadraticCurveTo(t+n,a,t+n,a+r),e.lineTo(t+n,a+o-r),e.quadraticCurveTo(t+n,a+o,t+n-r,a+o),e.lineTo(t+r,a+o),e.quadraticCurveTo(t,a+o,t,a+o-r),e.lineTo(t,a+r),e.quadraticCurveTo(t,a,t+r,a)}function Ji(e,t,a,n,o){if(!o.flipX&&!o.flipY){e.drawImage(t,o.sx??0,o.sy??0,a,n,o.x,o.y,o.w,o.h);return}e.save(),o.flipX&&(e.translate(o.x+o.w,0),e.scale(-1,1)),o.flipY&&(e.translate(0,o.y+o.h),e.scale(1,-1)),e.drawImage(t,o.sx??0,o.sy??0,a,n,o.flipX?0:o.x,o.flipY?0:o.y,o.w,o.h),e.restore()}var Yc=4;function qc(e,t,a,n,o,i,r){if(n<=2*r||o<=2*r){e.beginPath(),ra(e,t,a,n,o,i),e.clip();return}e.beginPath(),ra(e,t,a,n,o,i),ra(e,t+r,a+r,n-2*r,o-2*r,Math.max(0,i-r)),e.clip("evenodd")}function Xc(e,t,a,n,o,i,r,d,l,u,c,s){let p=s??Math.max(1,Math.round((Do+Yc*3)*c)),h=Math.max(0,r),f=!0;for(let g=0;g<3&&h>1e-4;g++){let b=Math.min(1,h);e.save(),qc(e,u.x,u.y,u.w,u.h,u.r,p),e.globalCompositeOperation=f?"source-over":"lighter",f=!1,e.globalAlpha=b,Ji(e,t,a,n,l),e.globalAlpha=1,e.globalCompositeOperation="destination-in",e.fillStyle=d,e.fillRect(0,0,o,i),e.restore(),h-=b}}function Ki(e,t,a,n,o,i,r){let d=r|0;if(d<1||n<=2*d||o<=2*d){e.beginPath(),ra(e,t,a,n,o,i),e.clip();return}e.beginPath(),ra(e,t,a,n,o,i),ra(e,t+d,a+d,n-2*d,o-2*d,Math.max(0,i-d)),e.clip("evenodd")}function jc(e,t,a,n,o,i,r,d,l,u,c,s){let p=d*c,h=!0;for(let f=0;f<3&&p>1e-4;f++){let g=Math.min(1,p);e.save(),Ki(e,r.x,r.y,r.w,r.h,r.r,l),e.globalCompositeOperation=h?"source-over":"lighter",h=!1,e.globalAlpha=g,Ji(e,t,a,n,s),e.globalAlpha=1,e.globalCompositeOperation="destination-in",e.fillStyle=u,e.fillRect(0,0,o,i),e.restore(),p-=g}}function Qc(e,t,a,n,o,i,r,d){let l=e.createLinearGradient(n,o,i,r);l.addColorStop(0,`rgba(255,255,255,${d.toFixed(3)})`),l.addColorStop(.5,`rgba(255,255,255,${(d*.45).toFixed(3)})`),l.addColorStop(1,"rgba(255,255,255,0)"),e.save(),Ki(e,t.x,t.y,t.w,t.h,t.r,a),e.globalCompositeOperation="lighter",e.lineWidth=a*2,e.strokeStyle=l,e.beginPath(),ra(e,t.x,t.y,t.w,t.h,t.r),e.stroke(),e.restore()}function Zi(e){let t=getComputedStyle(e),a=[parseFloat(t.borderTopLeftRadius)||0,parseFloat(t.borderTopRightRadius)||0,parseFloat(t.borderBottomRightRadius)||0,parseFloat(t.borderBottomLeftRadius)||0].filter(n=>n>0);return a.length?Math.min.apply(null,a):0}function es(e){let t=getComputedStyle(e),a=Math.max(parseFloat(t.borderTopWidth)||0,parseFloat(t.borderRightWidth)||0,parseFloat(t.borderBottomWidth)||0,parseFloat(t.borderLeftWidth)||0),n=0,o=0,i=t.boxShadow;if(i&&i!=="none"){let d=i.replace(/rgba?\([^)]*\)/g,c=>c.replace(/,/g,"\0")).split(/,\s*/),l=1/0,u=1/0;for(let c of d){let s=c.match(/-?\d+(?:\.\d+)?px/g);if(!s||s.length<4)continue;let p=parseFloat(s[3]);p>0&&(/\binset\b/.test(c)?p<l&&(l=p):p<u&&(u=p))}Number.isFinite(l)&&(n=l),Number.isFinite(u)&&(o=u)}let r=Math.max(a,o);return{width:Math.max(a,n,o)||1,outerCssPx:r}}function gi(e){e.cornerRadius=Zi(e.el);let t=es(e.el);e.hairlineWidth=t.width,e.hairlineOuterCssPx=t.outerCssPx}function Jc(e){typeof ResizeObserver<"u"&&(e.resizeObserver=new ResizeObserver(()=>gi(e)),e.resizeObserver.observe(e.el)),typeof MutationObserver<"u"&&(e.mutationObserver=new MutationObserver(()=>gi(e)),e.mutationObserver.observe(e.el,{attributes:!0,attributeFilter:["style","class"]}))}function Kc(e){var t,a;(t=e.resizeObserver)==null||t.disconnect(),e.resizeObserver=null,(a=e.mutationObserver)==null||a.disconnect(),e.mutationObserver=null}var Ut=new Set,Zc=Object.freeze({enabled:!0,radius:11.5,strength:.57,penumbra:.55,falloff:.21,edgeFade:.7,softness:.24,repaintMs:36}),Yo={...Zc};var Ot=null,Rn=0,vi=0,xi=!1;function Vn(){Rn!==0||typeof requestAnimationFrame>"u"||(Rn=requestAnimationFrame(e=>{if(Rn=0,e-vi<Yo.repaintMs){Vn();return}vi=e,as()}))}var $o=!1;function ed(e,t){let a=Yo.radius;for(let n of Ut){let o=n.anchorEl.getBoundingClientRect(),i=n.el.getBoundingClientRect(),r=Math.min(o.left,i.left)-a,d=Math.max(o.right,i.right)+a,l=Math.min(o.top,i.top)-a,u=Math.max(o.bottom,i.bottom)+a;if(e>=r&&e<=d&&t>=l&&t<=u)return!0}return!1}function yi(e){if(Ot={x:e.clientX,y:e.clientY},!Yo.enabled)return;let t=ed(e.clientX,e.clientY);(t||$o)&&Vn(),$o=t}function Oo(){Ot=null,$o&&Vn(),$o=!1}function ts(e){typeof document>"u"||e===xi||(xi=e,e?(document.addEventListener("pointermove",yi,{passive:!0}),document.addEventListener("pointerleave",Oo),window.addEventListener("blur",Oo)):(document.removeEventListener("pointermove",yi),document.removeEventListener("pointerleave",Oo),window.removeEventListener("blur",Oo),Ot=null))}function td(e,t,a,n,o,i,r,d,l){if(!Ot)return;let u=Yo;if(!u.enabled||u.strength<=0)return;let c=u.radius,s,p,h,f,g,b;if(o){let D=a.left>=n.right;s=D?n.right:a.right,p=D?a.left:n.left,h=Ot.x,f=Ot.y,g=Math.max(a.top,n.top),b=Math.min(a.bottom,n.bottom)}else{let D=a.top>=n.bottom;s=D?n.bottom:a.bottom,p=D?a.top:n.top,h=Ot.y,f=Ot.x,g=Math.max(a.left,n.left),b=Math.min(a.right,n.right)}let M=Math.min(s,p),x=Math.max(s,p),m=Math.max(1,x-M);if(h<M-c||h>x+c||f<g-c||f>b+c)return;let y=Math.max(0,Math.min(1,Math.abs(h-s)/m)),v=Math.max(.5,c*u.edgeFade),L=Math.min(1,Math.min(h-(M-c),x+c-h)/v),k=Math.min(1,Math.min(f-(g-c),b+c-f)/v),A=u.strength*(1-u.falloff*y)*L*k;if(A<=.001)return;let S=c*l*(1+u.penumbra*y),H=o?(f-n.top+d)*l:(f-n.left+d)*l,E=Math.max(0,Math.min(.5,(1-u.softness)*.5)),_=Math.max(.001,.5-E),w=o?r:i,I=Math.max(0,Math.floor(H-S)),O=Math.min(w,Math.ceil(H+S));if(O<=I)return;let F=new Float32Array(O-I);for(let D=I;D<O;D++){let B=(D+.5-(H-S))/(2*S),U=B<_?B/_:B>1-_?(1-B)/_:1;F[D-I]=1-A*Math.max(0,Math.min(1,U))}for(let D of[e,t]){let B=o?0:I,U=o?I:0,R=o?i:O-I,N=o?O-I:r,Q=D.getImageData(B,U,R,N),$=Q.data;if(o)for(let V=0;V<N;V++){let Z=F[V];if(!(Z>=.999))for(let ee=V*R*4+3,ne=(V+1)*R*4;ee<ne;ee+=4)$[ee]=$[ee]*Z}else for(let V=0;V<N;V++)for(let Z=0;Z<R;Z++){let ee=F[Z];if(ee>=.999)continue;let ne=(V*R+Z)*4+3;$[ne]=$[ne]*ee}D.putImageData(Q,B,U)}}var wt=null,ka=null,Aa=null,_a=null;function ad(e,t){return wt||(wt=document.createElement("canvas"),ka=document.createElement("canvas"),Aa=wt.getContext("2d",{alpha:!0}),_a=ka.getContext("2d",{alpha:!0})),!Aa||!_a||!wt||!ka?!1:(wt.width!==e&&(wt.width=e,ka.width=e),wt.height!==t&&(wt.height=t,ka.height=t),Aa.setTransform(1,0,0,1,0,0),_a.setTransform(1,0,0,1,0,0),Aa.globalCompositeOperation="source-over",_a.globalCompositeOperation="source-over",Aa.clearRect(0,0,e,t),_a.clearRect(0,0,e,t),!0)}function od(e,t,a,n=1){if(typeof document>"u"||$c.has(e.tagName))return null;for(let f of Ut)if(f.el===e)return f.strength=n,f;let o=document.createElement("div");o.setAttribute("data-metal-fx-reflection",""),o.setAttribute("aria-hidden","true");let i=document.createElement("canvas");i.className="metal-fx-reflection-canvas";let r=i.getContext("2d",{alpha:!0,willReadFrequently:!0});if(!r)return null;let d=document.createElement("canvas");d.className="metal-fx-reflection-stroke-canvas";let l=d.getContext("2d",{alpha:!0,willReadFrequently:!0});if(!l)return null;o.appendChild(i),o.appendChild(d);let u=getComputedStyle(e),c=!1;u.position==="static"&&(e.style.position="relative",c=!0);let s=!1;u.isolation!=="isolate"&&(e.style.isolation="isolate",s=!0),e.setAttribute("data-metal-fx-reflect-host",""),e.insertBefore(o,e.firstChild);let p=es(e),h={el:e,anchor:t,anchorEl:a,strength:n,wrap:o,canvas:i,ctx:r,strokeCanvas:d,strokeCtx:l,cornerRadius:Zi(e),hairlineWidth:p.width,hairlineOuterCssPx:p.outerCssPx,appliedPositionRelative:c,appliedIsolation:s,resizeObserver:null,mutationObserver:null};return Jc(h),Ut.add(h),ts(!0),h}function nd(e){for(let t of Ut)if(t.el===e){Kc(t),t.canvas.width=0,t.canvas.height=0,t.strokeCanvas.width=0,t.strokeCanvas.height=0,t.wrap.parentNode===t.el&&t.el.removeChild(t.wrap),t.el.removeAttribute("data-metal-fx-reflect-host"),t.appliedPositionRelative&&(t.el.style.position=""),t.appliedIsolation&&(t.el.style.isolation=""),Ut.delete(t),Ut.size===0&&ts(!1);return}}function rd(e,t,a,n,o){if(n<1||o<1)return null;let i=e.getContext("2d");if(!i)return null;let r=i.getImageData(t,a,n,o).data,d=n,l=o,u=-1,c=-1;for(let s=0;s<o;s++){let p=s*n;for(let h=0;h<n;h++)r[(p+h)*4+3]>8&&(h<d&&(d=h),h>u&&(u=h),s<l&&(l=s),s>c&&(c=s))}return u<0?null:{x:t+d,y:a+l,w:u-d+1,h:c-l+1}}function as(){if(Ut.size===0)return;let e=typeof window<"u"&&window.devicePixelRatio||1,t=new Map;for(let a of Ut){let n=a.el.getBoundingClientRect(),o=t.get(a.anchorEl);if(o||(o=a.anchorEl.getBoundingClientRect(),t.set(a.anchorEl,o)),n.width<1||n.height<1||o.width<1||o.height<1)continue;let i=a.el.hasAttribute("data-metal-fx-text");if(i&&!a.glyphStyled&&(a.canvas.style.filter="blur(0.4px) saturate(1.35) brightness(1.2)",a.glyphStyled=!0),!Wc(o,n,hi,ui)&&!Vc(o,n,hi,ui)){a.canvas.width!==1&&(a.canvas.width=1,a.canvas.height=1),a.strokeCanvas.width!==1&&(a.strokeCanvas.width=1,a.strokeCanvas.height=1);continue}let r=i&&!!a.anchor.mask;r&&!a.anchor.wantRaw&&(a.anchor.wantRaw=!0),a.anchor.wantRing||(a.anchor.wantRing=!0);let d=!!a.anchor.deform&&!!a.anchor.ringCanvas,l=r&&a.anchor.rawCanvas?a.anchor.rawCanvas:d?a.anchor.ringCanvas:a.anchor.canvas,u=Math.round(a.anchor.overscan*e),c=u,s=u,p=(l.width|0)-2*u,h=(l.height|0)-2*u;if(a.anchor.mask&&!r){let N=rd(l,c,s,p,h);N&&(c=N.x,s=N.y,p=N.w,h=N.h)}if(p<4||h<4)continue;let f=(o.left+o.right)*.5,g=(o.top+o.bottom)*.5,b=(n.left+n.right)*.5,M=(n.top+n.bottom)*.5,x=f-b,m=g-M,y=Math.max(o.left-n.right,n.left-o.right,0),v=Math.max(o.top-n.bottom,n.top-o.bottom,0),L=y>=v,k=Gc(o,n),A=1-Math.min(1,k/Do);A=A*A*(3-2*A);let S=pi+(Ac-pi)*A,H=Math.min(mi,S*Hc*Pc)*a.strength,E=o.left>=n.left&&o.right<=n.right&&o.top>=n.top&&o.bottom<=n.bottom?[!0,!1]:[L],_=a.anchor.scale??1,w=Math.max(Bc*_,a.hairlineWidth),I=Math.max(1,Math.round(w*e)),O=Math.max(1,Math.round(Math.max(Fc*_,a.hairlineWidth)*e)),F=a.hairlineOuterCssPx;a.wrap.style.inset=`${-F}px`,a.wrap.style.borderRadius=`${Math.max(0,a.cornerRadius)}px`;let D=Math.max(1,Math.round((n.width+F*2)*e)),B=Math.max(1,Math.round((n.height+F*2)*e));a.canvas.width!==D&&(a.canvas.width=D),a.canvas.height!==B&&(a.canvas.height=B),a.strokeCanvas.width!==D&&(a.strokeCanvas.width=D),a.strokeCanvas.height!==B&&(a.strokeCanvas.height=B);let U=a.ctx;U.setTransform(1,0,0,1,0,0),U.clearRect(0,0,D,B);let R=a.strokeCtx;R.setTransform(1,0,0,1,0,0),R.clearRect(0,0,D,B);for(let[N,Q]of E.entries()){let $=N>0&&ad(D,B),V=$?Aa:U,Z=$?_a:R,ee=Math.min((i?Do*1.5:Do)*e,Math.max(D,B)),ne,Re,C,J;Q?(ne=x>0?D:0,C=x>0?D-ee:ee,Re=B*.5,J=B*.5):(Re=m>0?B:0,J=m>0?B-ee:ee,ne=D*.5,C=D*.5);let re=U.createLinearGradient(ne,Re,C,J);re.addColorStop(0,`rgba(0,0,0,${_c})`),re.addColorStop(.5,`rgba(0,0,0,${Lc})`),re.addColorStop(1,`rgba(0,0,0,${Ic})`);let ae=p/e,le=i?Math.max(1,Math.min(Q?D:B,Math.round(Q?p:h))):Math.max(1,Math.round(zc*Math.max(.1,ae/140)*e)),ie,q,oe,X,me=!1,Ne=!1;if(Q){let ce=Math.max(o.top,n.top),ge=Math.min(o.bottom,n.bottom);me=!0,ie=x>0?D-le:0,q=Math.round((ce-n.top+F)*e),oe=le,X=Math.max(1,Math.round((ge-ce)*e))}else{let ce=Math.max(o.left,n.left),ge=Math.min(o.right,n.right);Ne=!0,ie=Math.round((ce-n.left+F)*e),q=m>0?B-le:0,oe=Math.max(1,Math.round((ge-ce)*e)),X=le}let Ye={x:ie,y:q,w:oe,h:X,flipX:me,flipY:Ne,sx:c,sy:s},Ge={x:0,y:0,w:D,h:B,r:Math.max(0,a.cornerRadius*e)},j=i?Math.min(1,H*fi):Math.min(mi,H*Uc*fi*Nc);Xc(V,l,p,h,D,B,j,re,Ye,Ge,e,i?Math.max(D,B):void 0),i||(jc(Z,l,p,h,D,B,Ge,H,I,re,Oc,Ye),Qc(Z,Ge,O,ne,Re,C,J,Math.min(.85,Dc*H))),$&&(U.globalCompositeOperation="lighter",U.drawImage(wt,0,0),R.globalCompositeOperation="lighter",R.drawImage(ka,0,0))}for(let N of E)td(U,R,o,n,N,D,B,F,e);U.globalCompositeOperation="source-over",R.globalCompositeOperation="source-over"}}var Sn=!1,wi=0;function id(){Sn||(Sn=!0,!(typeof requestAnimationFrame>"u")&&requestAnimationFrame(e=>{Sn=!1,!(e-wi<ol)&&(wi=e,as())}))}var bi="metal-fx-styles",sd=`
.metal-fx-root {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  overflow: visible;
  background: #272727;
  color: #f8f8f8;
}
.metal-fx-root[data-theme='light'] {
  background: #ffffff;
  color: #1d1d1d;
}

.metal-fx-root::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 2;
  box-shadow: inset 0 0 50px 0 rgba(255, 255, 255, 0.02);
}
.metal-fx-root[data-theme='light']::before {
  box-shadow: inset 0 0 50px 0 rgba(0, 0, 0, 0.02);
}

.metal-fx-root::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 4;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.metal-fx-root[data-theme='light']::after {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
/* Circle variant gets a thicker outer rim than the button variant. */
.metal-fx-root[data-variant='circle']::after {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
}
.metal-fx-root[data-theme='light'][data-variant='circle']::after {
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.06);
}

.metal-fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
}

/* The inner spacer \u2014 defines the inset geometry where the metal ring meets
   the interior (3 px for Button, 1-2 px for Circle) and carries the Circle dark
   hairline ('box-shadow: inset' rules below). Intentionally transparent so
   the wrapper's background propagates through to the punched shader centre,
   giving consumers a single surface tone to override. See "Single-surface
   background" in the file header for the rationale. */
.metal-fx-inner {
  position: absolute;
  inset: 3px;
  border-radius: inherit;
  z-index: 1;
  pointer-events: none;
}

.metal-fx-root[data-variant='button'][data-shape='pill'] .metal-fx-inner {
  border-radius: calc(var(--mfx-radius, 20px) - 3px);
}
.metal-fx-root[data-variant='button'][data-shape='circle'] .metal-fx-inner {
  border-radius: calc(var(--mfx-radius, 16px) - 3px);
}
.metal-fx-root[data-variant='circle'][data-shape='pill'] .metal-fx-inner {
  inset: 0;
  border-radius: var(--mfx-radius, 20px);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
}
.metal-fx-root[data-variant='circle'][data-shape='circle'] .metal-fx-inner {
  inset: 0;
  border-radius: var(--mfx-radius, 16px);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
}
/* Circle-variant hairline alpha \u2014 light mode.
   Source-of-truth: index.html L2261-2267. The 0.45-alpha black inset that
   reads as a single-pixel frame against the dark interior is too heavy
   on a #ffffff inner: it ends up looking like a hard 2-px black ring
   against the iridescent shader. Suppressed entirely (alpha 0) \u2014 the
   shader's own iridescent rim already defines the silhouette in light
   mode, so an extra dark hairline only competes with it. The rule is
   kept (rather than deleted) as a tunable hook in case a future variant
   wants to re-introduce a soft edge. NOTE: we keep the dark-mode inset
   and border-radius values because \u2014 unlike index.html \u2014 our renderer
   does NOT overscan the canvas in light mode, so there is no 1-px gap
   between inner element and shader to compensate for. */
.metal-fx-root[data-theme='light'][data-variant='circle'][data-shape='pill'] .metal-fx-inner,
.metal-fx-root[data-theme='light'][data-variant='circle'][data-shape='circle'] .metal-fx-inner {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0);
}

/* \u2500\u2500\u2500 Combined glow SVG (z=3) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Single SVG per instance that holds BOTH the wide-halo group
   (#mfx_haloTravel) and the catch-light group (#mfx_extraTravel), exactly
   mirroring canonical's _buildGlowSvgInner (index.html L8078). One
   mix-blend-mode: screen lifts the combined composite onto the shader
   ring; per-frame opacity attributes on each inner group still drive the
   independent fade-in / fade-out cycles for the halo and the catch-light.

   Why a single SVG: the circle variant anchors halo + catch-light at the same
   perimeter point, so they overlap in the bright zone. Two separately-
   screened SVGs would double-screen the overlap (A + B + C - AB - AC -
   BC + ABC instead of A + B + C - AB - AC once both groups composite
   in source-over inside one SVG and then screen against the host once).
   That overlap looked muted versus canonical specifically on the circle
   variant where both layers travel together.

   Source-of-truth opacity: #btnGlowSvg drops to 0.7 in dark and 0.2746 in
   light (index.html L632/L643). */
.metal-fx-glow-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  z-index: 3;
  pointer-events: none;
  opacity: 0.7;
}
.metal-fx-root[data-theme='light'] .metal-fx-glow-svg {
  /* Light-mode 1-px overscan mirrors .btn-glow-svg in metal.html so the
     halo stays glued to the visible silhouette (the shader ring there sits
     1 px outside the host's padding box). */
  inset: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  mix-blend-mode: multiply;
  /* Source-of-truth: html[data-theme="light"] #btnGlowSvg { opacity: 0.2746 }
     \u2192 \u221235 % from 0.4225 from the original 0.7 dark-mode opacity. */
  opacity: 0.2746;
  filter: saturate(5.355) brightness(0.78);
}
/* Circle light-mode small variants (e.g. 36\xD736 send button): the geometrically
   shrunk halo loses density when multiplied against #ffffff. Mirror the
   canonical override at index.html L2316 \u2014 bump saturation + drop brightness
   so the small glow holds together visually. */
.metal-fx-root[data-variant='circle'][data-shape='circle'][data-theme='light'] .metal-fx-glow-svg {
  filter: saturate(7.5) brightness(0.6);
}

/* The wrapped child \u2014 hoisted into z=5 so it sits above every overlay, with
   normalized chrome so consumer button styles don't fight the metal frame. */
.metal-fx-content {
  position: relative;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  pointer-events: none;
}
.metal-fx-content > * {
  pointer-events: auto;
}
.metal-fx-root[data-normalize='true'] .metal-fx-content > * {
  background: transparent !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  /* Sizing: we deliberately DO NOT force \`width: 100%; height: 100%\` on the
     child here. That used to be the contract ("the wrapper is the visible
     button surface; the child stretches to fill it"), but it created a cyclic
     percentage dependency: the wrapper is \`inline-flex\` with no intrinsic
     size, .metal-fx-content is \`width/height: 100%\` of the wrapper, and the
     child was \`100%\` of .metal-fx-content. With nothing breaking the cycle,
     icon-only / class-sized children collapsed.

     The new contract: the child sizes itself (intrinsic content, CSS class,
     or inline style \u2014 all work), and the wrapper's \`inline-flex\` wraps it
     tightly. Consumers who want a metal frame BIGGER than the child (e.g.
     padding around an icon) size <MetalFx style={{ width, height }}> AND
     explicitly set width/height on the child to fill (or accept that the
     child renders at its intrinsic size, centered).

     Typography is intentionally NOT touched. We used to apply
     \`color: inherit; font: inherit;\` here to "match" the wrapper, but
     \`font: inherit\` is a shorthand that overrides font-family, font-size,
     font-weight, AND line-height on the child \u2014 which (a) shrank the
     button height (line-height changes propagate through the flex
     content box) and (b) scaled em-based icons / font-icons inside the
     child to whatever the wrapper inherited. The wrapper now stays out
     of the child's typography entirely; consumers who want typographic
     normalization can apply it themselves on the child element. */
}

[data-metal-fx-reflection] {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  overflow: hidden;
  z-index: 0;
  isolation: isolate;
}
.metal-fx-reflection-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  filter: blur(4px) saturate(1.2) brightness(1.58);
}
.metal-fx-reflection-stroke-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  filter: saturate(1.35) brightness(1.75);
}
/* Hosts that participate as reflection targets need positioning + isolation
   so the wrap composites only against the host (not the parent stack). The
   wrap injects these inline as well, but stating them here keeps reflections
   working on hosts that already have other inline styles applied. */
[data-metal-fx-reflect-host] {
  isolation: isolate;
}
`,Tn=!1;function ld(){if(Tn||typeof document>"u")return;if(document.getElementById(bi)){Tn=!0;return}let e=document.createElement("style");e.id=bi,e.textContent=sd,document.head.appendChild(e),Tn=!0}ld();var cd={position:"absolute",inset:0,width:"100%",height:"100%"},dd={position:"absolute",inset:3},ud={position:"absolute",inset:0,pointerEvents:"none",zIndex:3,borderRadius:"inherit"},hd={position:"absolute",inset:0,pointerEvents:"none",zIndex:4},ro=new Map;function pd(){let e=globalThis;e.__MFX_DEBUG__&&(e.__mfxGlow=ro)}Fl((e,t)=>{let a=ro.get(e);return a?Sc(a.handles,e,t,e.opacityMul*e.glowGain,a.themeRef.current):!1});function md(e){let[t,a]=Mi(()=>e!=="auto"?e:typeof window>"u"||!window.matchMedia||window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");return bt(()=>{if(e!=="auto"){a(e);return}if(typeof window>"u"||!window.matchMedia)return;let n=window.matchMedia("(prefers-color-scheme: dark)"),o=()=>a(n.matches?"dark":"light");return o(),n.addEventListener("change",o),()=>n.removeEventListener("change",o)},[e]),t}var po=Zs(function({children:e,variant:t="button",preset:a="chromatic",theme:n="auto",strength:o=1,glowGain:i=1,paused:r=!1,borderRadius:d,normalizeHostStyles:l=!0,reflectionTargets:u,disableGlow:c=!1,innerShadow:s,shaderScale:p,ringCssPx:h,scale:f=1,mask:g,glowMode:b="mask",className:M,style:x,...m},y){let v=st(null),L=st(null),k=st(null),A=st(null),S=st(null),H=st(null),E=st(null),_=st(null),w=st("dark"),I=st(0),[O,F]=Mi(!1),D=md(n),B=Br(()=>bl(),[]);w.current=D;let U=t==="circle"?"circle":"pill",R=!c;el(y,()=>v.current,[]);let N=($,V)=>{if(U==="circle")return Math.min($,V)/2;let Z=typeof d=="number"?d:(()=>{var ee;let ne=(ee=H.current)==null?void 0:ee.firstElementChild;if(ne){let Re=parseFloat(getComputedStyle(ne).borderTopLeftRadius);if(Number.isFinite(Re)&&Re>0)return Re}return I.current})();return Math.min(Z,Math.min($,V)/2)};bt(()=>{B&&Ol(a,D)},[a,D,B]),bt(()=>{let $=E.current;$&&Ta($,{mask:g??null})},[g]),bt(()=>{let $=E.current;$&&Ta($,{paused:r})},[r]),bt(()=>{let $=E.current;if(!$)return;let V={};p!==void 0&&(V.shaderScale=p),h!==void 0&&(V.ringCssPx=h),f!==void 0&&(V.scale=f),Object.keys(V).length>0&&Ta($,V)},[p,h,f]),tl(()=>{let $=L.current,V=v.current,Z=k.current;if(!$||!V||!B)return;{let j=getComputedStyle(V),ce=parseFloat(j.borderTopLeftRadius);I.current=Number.isFinite(ce)?ce:0}let ee=()=>{let j=V.getBoundingClientRect(),ce=Math.max(1,Math.round(j.width)),ge=Math.max(1,Math.round(j.height));return{cssWidth:ce,cssHeight:ge,cornerRadius:N(ce,ge)}},ne=ee();E.current=kl({onComposite:()=>{let j=E.current,ce=_.current;j&&ce&&Rc(ce,j.deform);let ge=S.current;j&&ge&&Qi(ge,j.deform)},hostCanvas:$,cssWidth:ne.cssWidth,cssHeight:ne.cssHeight,cornerRadius:ne.cornerRadius,kind:U,paused:r,shaderScale:p,ringCssPx:h,scale:f,mask:g??null,onFirstCopy:()=>F(!0)}),V.style.setProperty("--mfx-radius",`${ne.cornerRadius}px`),V.style.borderRadius=`${ne.cornerRadius}px`;let Re=(j,ce)=>{if(!g||b==="ring")return{};let ge=window.devicePixelRatio||1,Ie=document.createElement("canvas");Ie.width=Math.max(1,Math.round(j*ge)),Ie.height=Math.max(1,Math.round(ce*ge));let xa=Ie.getContext("2d");if(!xa)return{};xa.fillStyle="#fff",g(xa,Ie.width,Ie.height,ge);let ya=xa.getImageData(0,0,Ie.width,Ie.height).data,So=[],At=Math.max(1,Math.round(2*ge));for(let wa=At>>1;wa<Ie.height;wa+=At)for(let gt=At>>1;gt<Ie.width;gt+=At)ya[(wa*Ie.width+gt)*4+3]>128&&So.push({x:gt/ge,y:wa/ge});return{samplePoints:So,maskDataUrl:Ie.toDataURL("image/png")}};Z&&(_.current=ii(Z,{width:ne.cssWidth,height:ne.cssHeight,cornerRadius:ne.cornerRadius,kind:U,scale:f,...Re(ne.cssWidth,ne.cssHeight)}));let C=j=>{if(!Z)return;let ce=_.current;Z.innerHTML="",_.current=ii(Z,{width:j.cssWidth,height:j.cssHeight,cornerRadius:j.cornerRadius,kind:U,scale:f,...Re(j.cssWidth,j.cssHeight)}),ce&&Cc(ce,_.current);let ge=E.current;ge&&_.current&&ro.set(ge,{handles:_.current,themeRef:w})},J=()=>s?s===!0?li:{...li,...s}:null,re=j=>{let ce=A.current,ge=E.current;di(S.current),S.current=null;let Ie=J();!ce||!ge||!Ie||(S.current=kc(ce,{width:j.cssWidth,height:j.cssHeight,cornerRadius:j.cornerRadius,kind:U,ring:ge.ringCssPx},Ie))};re(ne);let ae=0,le=ne.cssWidth,ie=ne.cssHeight,q=ne.cornerRadius,oe=new ResizeObserver(()=>{ae===0&&(ae=requestAnimationFrame(()=>{ae=0;let j=ee(),ce=E.current;!ce||Math.abs(j.cssWidth-le)<.5&&Math.abs(j.cssHeight-ie)<.5&&Math.abs(j.cornerRadius-q)<.5||(le=j.cssWidth,ie=j.cssHeight,q=j.cornerRadius,Ta(ce,{cssWidth:j.cssWidth,cssHeight:j.cssHeight,cornerRadius:j.cornerRadius}),V.style.setProperty("--mfx-radius",`${j.cornerRadius}px`),V.style.borderRadius=`${j.cornerRadius}px`,C(j),re(j))}))});oe.observe(V);let X=null,me=()=>{let j=E.current;if(j&&Hl(j)){let ce=ee();C(ce),re(ce)}Ne()},Ne=()=>{X?.removeEventListener("change",me),X=typeof window.matchMedia=="function"?window.matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`):null,X?.addEventListener("change",me)};Ne();let Ye=Gl(j=>{j&&E.current&&C(ee())}),Ge=null;return typeof IntersectionObserver<"u"&&(Ge=new IntersectionObserver(j=>{let ce=E.current;if(ce)for(let ge of j)Il(ce,ge.isIntersecting)},{rootMargin:"64px"}),Ge.observe(V)),E.current&&_.current&&(ro.set(E.current,{handles:_.current,themeRef:w}),_l(E.current)),Xl(),pd(),()=>{jl(),di(S.current),S.current=null,oe.disconnect(),X?.removeEventListener("change",me),Ge?.disconnect(),Ye(),ae!==0&&cancelAnimationFrame(ae);let j=E.current;j&&(ro.delete(j),Ll(j),Al(j)),E.current=null,_.current=null,Z&&(Z.innerHTML="")}},[U]),bt(()=>{let $=E.current;$&&Ta($,{opacityMul:Math.max(0,Math.min(1,o)),glowGain:Math.max(0,i)})},[o,i,t]),bt(()=>{let $=E.current,V=v.current;if(!$||!V||!u||D!=="dark")return;$.onAfterFrame=id;let Z=u.flatMap(ee=>{let ne="current"in ee?ee:ee.ref,Re="current"in ee?1:ee.strength??1;return ne.current?[{el:ne.current,strength:Re}]:[]});for(let{el:ee,strength:ne}of Z)od(ee,$,V,ne);return()=>{$.onAfterFrame=void 0;for(let{el:ee}of Z)nd(ee)}},[u,D]),bt(()=>{let $=v.current,V=E.current;if(!$||!V)return;let Z=N(V.cssWidth,V.cssHeight);Ta(V,{cornerRadius:Z}),$.style.setProperty("--mfx-radius",`${Z}px`),$.style.borderRadius=`${Z}px`},[d,D,t,U]);let Q=Br(()=>({...x,"--mfx-strength":String(Math.min(1,Math.max(0,o))),opacity:O?1:0,visibility:O?"visible":"hidden",transition:O?"opacity 0.15s ease-out":"none"}),[x,o,O]);return B?Ks("div",{...m,ref:v,className:M?`metal-fx-root ${M}`:"metal-fx-root","data-variant":t,"data-shape":U,"data-theme":D,"data-paused":r?"true":void 0,"data-normalize":l?"true":"false",style:Q,children:[Ea("canvas",{ref:L,className:"metal-fx-canvas",style:cd}),Ea("div",{className:"metal-fx-inner","aria-hidden":"true",style:dd}),Ea("div",{ref:k,"aria-hidden":"true",style:{...ud,display:R?void 0:"none"}}),s?Ea("div",{ref:A,"aria-hidden":"true",style:hd}):null,Ea("div",{ref:H,className:"metal-fx-content",children:e})]}):Ea("div",{...m,ref:v,className:M?`metal-fx-fallback ${M}`:"metal-fx-fallback","data-metal-fx-unsupported":"",style:{display:"inline-flex",...x},children:e})});po.displayName="MetalFx";var fd={offsetY:1,blur:.5,alpha:.9},iu=Object.freeze({metalOpacity:.62,shaderScale:2.8,glowGain:2.5,innerShadow:fd});var gd=45;var vd=26.667,su=(gd-vd)/2;var lu=Object.freeze({metalOpacity:.8,shaderScale:1.6,core:Object.freeze({r:46,blur:100,a:.94,size:49}),gradient:0,glow:.41});var Yn=Object.freeze({enabled:!0,applyTo:"ring",strength:.74,fadeInMs:200,fadeOutMs:350,smoothMs:140,reach:36,blob:13,liquidBlob:10,maxDisp:9,gain:.6,pressGain:.55,pullGain:.49,press:5,liquid:7.5,liquidReach:8,liquidStiffness:53,liquidDamping:9,stiffness:260,damping:13,mass:1,follow:.32,mapRes:2,smooth:.25}),xd={...Yn};function os(e,t=()=>xd){bt(()=>{let a=e.current;if(!a||typeof document>"u")return;let n=a.querySelector("canvas.metal-fx-canvas"),o=a.querySelector(".metal-fx-inner"),i=null,r=null,d=!1,l=!1,u=0,c=0,s=0,p=0,h=0,f=0,g=0,b=0,M=0,x=0,m=0,y=0,v=0,L=0,k=0,A=0,S=0,H=0,E=NaN,_=NaN,w=NaN,I=NaN,O=NaN,F=0,D=0,B=0,U=1,R=1,N=(pe,W,ve)=>{let Be=pe-u,He=W-c,qe=Be*Be+He*He,it=Math.exp(-qe/U),_t=Math.exp(-qe/R);ve.x=F*it+Be*B*_t,ve.y=D*it+He*B*_t},Q={x:0,y:0},$=(pe,W,ve)=>{N(pe,W,Q),ve.x=pe+Q.x,ve.y=W+Q.y},V="mfx-bend-style";if(!document.getElementById(V)){let pe=document.createElement("style");pe.id=V,pe.textContent=".metal-fx-root[data-mfx-bend]::before,.metal-fx-root[data-mfx-bend]::after{box-shadow:none!important}",document.head.appendChild(pe)}let Z=!1,ee=null,ne=a.style.background,Re=o?.style.visibility??"",C=pe=>{if(!pe||pe==="none")return null;let W=pe.match(/^(rgba?\([^)]*\)|#[0-9a-fA-F]+|[a-z]+)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/);return W?{color:W[1],spread:Math.abs(parseFloat(W[5]))}:null},J=pe=>{if(Z||!n)return;let W=C(getComputedStyle(a,"::after").boxShadow),ve=o?C(getComputedStyle(o).boxShadow):null,Be=o&&parseFloat(getComputedStyle(o).inset)||0;ee={fill:getComputedStyle(a).backgroundColor,rim:W&&W.spread>0?{inset:0,width:W.spread,color:W.color}:null,hairline:ve&&ve.spread>0?{inset:Be,width:ve.spread,color:ve.color}:null},a.style.background="transparent",a.setAttribute("data-mfx-bend",""),o&&(o.style.visibility="hidden"),$r(n,$,ee,pe),Z=!0},re=()=>{!Z||!n||($r(n,null,null,0),a.style.background=ne,a.removeAttribute("data-mfx-bend"),o&&(o.style.visibility=Re),Z=!1)},ae=`mfx-bend-${Math.random().toString(36).slice(2,8)}`,le="http://www.w3.org/2000/svg",ie=.75,q=document.createElementNS(le,"svg");q.setAttribute("aria-hidden","true"),q.style.cssText="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";let oe=document.createElementNS(le,"filter");oe.setAttribute("id",ae),oe.setAttribute("x",`-${ie*100}%`),oe.setAttribute("y",`-${ie*100}%`),oe.setAttribute("width",`${(1+2*ie)*100}%`),oe.setAttribute("height",`${(1+2*ie)*100}%`),oe.setAttribute("color-interpolation-filters","sRGB");let X=document.createElementNS(le,"feFlood");X.setAttribute("flood-color","rgb(128,128,0)"),X.setAttribute("flood-opacity","1"),X.setAttribute("result","neutral");let me=document.createElementNS(le,"feImage");me.setAttribute("result","img"),me.setAttribute("preserveAspectRatio","none");let Ne=document.createElementNS(le,"feComposite");Ne.setAttribute("in","img"),Ne.setAttribute("in2","neutral"),Ne.setAttribute("operator","over"),Ne.setAttribute("result","map");let Ye=document.createElementNS(le,"feDisplacementMap");Ye.setAttribute("in","SourceGraphic"),Ye.setAttribute("in2","map"),Ye.setAttribute("xChannelSelector","R"),Ye.setAttribute("yChannelSelector","G"),Ye.setAttribute("result","bent");let Ge=document.createElementNS(le,"feGaussianBlur");Ge.setAttribute("in","bent"),Ge.setAttribute("stdDeviation","0");for(let pe of[X,me,Ne,Ye,Ge])oe.appendChild(pe);q.appendChild(oe),document.body.appendChild(q);let j=document.createElement("canvas"),ce=j.getContext("2d",{alpha:!1,willReadFrequently:!0}),ge=null,Ie=null,xa=4278222976,ya=!1,So=a.style.filter,At=()=>{ya&&(a.style.filter=So,ya=!1)},wa=(pe,W,ve,Be)=>{if(!ce)return;let He=Math.max(.25,pe.mapRes),qe=-W*ie,it=-ve*ie,_t=W*(1+2*ie),vt=ve*(1+2*ie),Xe=Math.max(2,Math.round(_t*He)),Lt=Math.max(2,Math.round(vt*He));(j.width!==Xe||j.height!==Lt||!ge||!Ie)&&(j.width=Xe,j.height=Lt,ge=ce.createImageData(Xe,Lt),Ie=new Uint32Array(ge.data.buffer)),Ie.fill(xa);let ba=ge.data,It=3*Math.max(pe.blob,pe.liquidBlob),ko=Math.max(0,Math.floor((u-It-qe)*He)),Qa=Math.min(Xe-1,Math.ceil((u+It-qe)*He)),cn=Math.max(0,Math.floor((c-It-it)*He)),dn=Math.min(Lt-1,Math.ceil((c+It-it)*He)),Ao=255/Be;for(let Ht=cn;Ht<=dn;Ht++){let Ja=it+(Ht+.5)/He,Qt=(Ht*Xe+ko)*4;for(let Ma=ko;Ma<=Qa;Ma++,Qt+=4){let _o=qe+(Ma+.5)/He;N(_o,Ja,Q);let xt=127.5-Q.x*Ao;xt=xt<0?0:xt>255?255:xt;let Jt=127.5-Q.y*Ao;Jt=Jt<0?0:Jt>255?255:Jt,ba[Qt]=xt,ba[Qt+1]=Jt}}ce.putImageData(ge,0,0),me.setAttribute("x",qe.toFixed(2)),me.setAttribute("y",it.toFixed(2)),me.setAttribute("width",_t.toFixed(2)),me.setAttribute("height",vt.toFixed(2)),me.setAttribute("href",j.toDataURL("image/png")),Ye.setAttribute("scale",Be.toFixed(2)),Ge.setAttribute("stdDeviation",Math.max(0,pe.smooth).toFixed(3)),ya||(a.style.filter=`url(#${ae})`,ya=!0)},gt=()=>{A===0&&(S=performance.now(),A=requestAnimationFrame(wr))},wr=pe=>{A=0;let W=t(),ve=Math.min(.032,Math.max(.001,(pe-S)/1e3));S=pe;let Be=a.getBoundingClientRect(),He=Be.width,qe=Be.height,it=He/2,_t=qe/2,vt=0,Xe=0;if(y=0,W.enabled&&i){let Kt=i.x-Be.left,un=i.y-Be.top,Er=Kt-it,Rr=un-_t,Pt=Math.hypot(Er,Rr),Sr=Math.min(He,qe)/2,Tr=Math.max(He,qe)/2+W.reach,js=l;l=Pt<Tr;let hn=Math.max(0,1-Math.abs(Pt-Sr)/Math.max(1,W.liquidReach));if(y=hn*hn*(3-2*hn),l){js||(u=Kt,c=un);let Cr=1-Math.pow(1-Math.min(.999,W.follow),ve*60);u+=(Kt-u)*Cr,c+=(un-c)*Cr;let kr=1-Math.max(0,(Pt-(Tr-W.reach))/W.reach);vt=L*(W.gain/100)*kr,Xe=k*(W.gain/100)*kr;let Ar=Pt>.001?Er/Pt:0,_r=Pt>.001?Rr/Pt:0,pn=Sr-Pt;if(pn>0){let Ka=pn*W.pressGain;vt-=Ar*Ka,Xe-=_r*Ka}else{let Ka=-pn,fn=Math.max(0,1-Ka/Math.max(1,W.reach)),Lr=Ka*W.pullGain*(fn*fn*(3-2*fn));vt+=Ar*Lr,Xe+=_r*Lr}let mn=Math.hypot(vt,Xe);mn>W.maxDisp&&(vt*=W.maxDisp/mn,Xe*=W.maxDisp/mn)}}else l=!1;L*=Math.exp(-ve*12),k*=Math.exp(-ve*12);let Lt=1-Math.exp(-(ve*1e3)/Math.max(1,W.smoothMs));M+=(vt-M)*Lt,x+=(Xe-x)*Lt;let ba=Math.max(.05,W.mass);h+=(-W.stiffness*(s-M)-W.damping*h)/ba*ve,f+=(-W.stiffness*(p-x)-W.damping*f)/ba*ve,s+=h*ve,p+=f*ve;let It=d&&l&&W.enabled?W.press:0,ko=l&&W.enabled?W.liquid*(y+(d?.5:0)):0;m+=(ko-m)*Lt,b+=(-W.liquidStiffness*(g-m)-W.liquidDamping*b)/ba*ve,g+=b*ve;let Qa=l&&W.enabled?1:0,cn=Math.max(1,Qa?W.fadeInMs:W.fadeOutMs)/3;v+=(Qa-v)*(1-Math.exp(-(ve*1e3)/cn)),v<.002&&Qa===0&&(v=0);let dn=Math.hypot(s,p),Ao=!l&&v===0&&dn<.05&&Math.hypot(h,f)<1&&Math.abs(g)<.05&&It===0;if(W.applyTo==="ring"?At():re(),Ao){s=p=h=f=g=b=0,M=x=m=0,E=_=w=I=O=NaN,re(),At();return}let Ht=Math.max(0,W.strength)*v,Ja=it-u,Qt=_t-c,Ma=Math.hypot(Ja,Qt)||1;Ja/=Ma,Qt/=Ma;let _o=Math.max(.5,W.blob),xt=Math.max(.5,W.liquidBlob);U=2*_o*_o,R=2*xt*xt,F=(s+Ja*It)*Ht,D=(p+Qt*It)*Ht,B=g/xt*Ht;let Jt=!(Math.abs(s-E)<.05&&Math.abs(p-_)<.05&&Math.abs(g-w)<.05&&Math.abs(u-I)<.05&&Math.abs(c-O)<.05),Xs=pe-H>=1e3/60-.5;if(Jt&&Xs)if(H=pe,E=s,_=p,w=g,I=u,O=c,W.applyTo==="ring"&&n){let Kt=Math.ceil((W.maxDisp+W.liquid*1.5)*Math.max(1,W.strength))+4;J(Kt),Pl(n)}else{let Kt=Math.max(1,(W.maxDisp+W.liquid*1.5)*2*Math.max(1,W.strength));wa(W,He,qe,Kt)}else W.applyTo==="ring"&&n&&!Z&&J(Math.ceil((W.maxDisp+W.liquid*1.5)*Math.max(1,W.strength))+4);A=requestAnimationFrame(wr)},br=pe=>{let W=performance.now();if(r){let ve=Math.max(.004,(W-r.t)/1e3),Be=1-Math.exp(-ve/.04);L+=((pe.clientX-r.x)/ve-L)*Be,k+=((pe.clientY-r.y)/ve-k)*Be}r={x:pe.clientX,y:pe.clientY,t:W},i={x:pe.clientX,y:pe.clientY},gt()},To=()=>{i=null,r=null,gt()},Mr=()=>{d=!0,gt()},Co=()=>{d=!1,gt()};return document.addEventListener("pointermove",br,{passive:!0}),document.addEventListener("pointerleave",To),window.addEventListener("blur",To),a.addEventListener("pointerdown",Mr),document.addEventListener("pointerup",Co),document.addEventListener("pointercancel",Co),()=>{A!==0&&cancelAnimationFrame(A),document.removeEventListener("pointermove",br),document.removeEventListener("pointerleave",To),window.removeEventListener("blur",To),a.removeEventListener("pointerdown",Mr),document.removeEventListener("pointerup",Co),document.removeEventListener("pointercancel",Co),re(),At(),q.parentNode&&q.parentNode.removeChild(q)}},[e,t])}Fi({cursor:!1,spill:!1});

  function buildDom(vnode) {
    if (!vnode) return null;
    if (vnode instanceof Node) return vnode;
    var dom = document.createElement(vnode.tag || 'div');
    var props = vnode.props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === undefined || v === null || k === 'children') return;
      if (k === 'ref') {
        if (typeof v === 'function') v(dom);
        else if (v && typeof v === 'object') v.current = dom;
      } else if (k === 'className') {
        dom.className = v;
      } else if (k === 'style' && typeof v === 'object') {
        Object.keys(v).forEach(function (sk) {
          if (v[sk] === undefined || v[sk] === null) return;
          if (sk.indexOf('--') === 0) dom.style.setProperty(sk, v[sk]);
          else dom.style[sk] = v[sk];
        });
      } else if (k.indexOf('data-') === 0 || k.indexOf('aria-') === 0 || k === 'id' || k === 'role') {
        dom.setAttribute(k, String(v));
      }
    });
    var children = props.children;
    if (Array.isArray(children)) {
      children.forEach(function (c) {
        var childDom = buildDom(c);
        if (childDom) dom.appendChild(childDom);
      });
    } else if (children) {
      var childDom = buildDom(children);
      if (childDom) dom.appendChild(childDom);
    }
    return dom;
  }

  window.mountAeraMetalFx = function (host, options) {
    options = options || {};
    var comp = {
      hooks: [],
      hookIdx: 0,
      layoutEffects: [],
      effects: [],
      cleanups: [],
      dom: null,
      render: function () {
        comp.hookIdx = 0;
        comp.layoutEffects = [];
        comp.effects = [];
        currentComponent = comp;
        var vnode = po(Object.assign({
          preset: 'chromatic',
          variant: 'button',
          theme: 'dark',
          innerShadow: true,
          strength: 0.9,
          ringCssPx: 1.8,
          glowGain: 0.65,
          paused: matchMedia('(prefers-reduced-motion: reduce)').matches,
          borderRadius: 26
        }, options), null);
        currentComponent = null;
        if (!comp.dom) {
          comp.dom = buildDom(vnode);
          host.replaceChildren(comp.dom);
          comp.layoutEffects.forEach(function (fx) {
            var c = fx();
            if (typeof c === 'function') comp.cleanups.push(c);
          });
          comp.effects.forEach(function (fx) {
            var c = fx();
            if (typeof c === 'function') comp.cleanups.push(c);
          });
        } else if (vnode && vnode.props && vnode.props.style) {
          Object.keys(vnode.props.style).forEach(function (sk) {
            var val = vnode.props.style[sk];
            if (val === undefined || val === null) return;
            if (sk.indexOf('--') === 0) comp.dom.style.setProperty(sk, val);
            else comp.dom.style[sk] = val;
          });
        }
      }
    };
    comp.render();
    if (options.enableBend && comp.dom) {
      var bendComp = {
        hooks: [],
        hookIdx: 0,
        layoutEffects: [],
        effects: [],
        render: function () {}
      };
      currentComponent = bendComp;
      var rootRef = { current: comp.dom };
      var bendCfg = Object.assign({}, Yn, { applyTo: 'ring', strength: 0.45, maxDisp: 4, damping: 34, liquidDamping: 16 });
      os(rootRef, function () { return bendCfg; });
      currentComponent = null;
      bendComp.effects.forEach(function (fx) {
        var c = fx();
        if (typeof c === 'function') comp.cleanups.push(c);
      });
    }
    return comp;
  };
})();