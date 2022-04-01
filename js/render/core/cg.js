"use strict";

// MISCELLANEOUS METHODS

   export let round = t => {
      let v = (100 * Math.max(0, Math.min(1, t)) >> 0) / 100;
      return v==1 ? '1.00' : '0.' + (v<.1 ? '0' + (v*10>>0) : v*100>>0);
   }

// VECTOR METHODS

   let mixf = (a,b,t,u) => a * (u===undefined ? 1-t : t) + b * (u===undefined ? t : u);
   export let cross = (a,b) => [ a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0] ];
   export let dot = (a,b) => a[0] * b[0] + a[1] * b[1] + ( a.length < 3 ? 0 : a[2] * b[2] +
      ( a.length < 4 ? 0 : a[3] * b[3] ));
   export let mix = (a,b,t,u) => [ mixf(a[0],b[0],t,u), mixf(a[1],b[1],t,u), mixf(a[2],b[2],t,u) ];
   export let norm = v => Math.sqrt(dot(v,v));
   export let normalize = (v,s) => scale(v, 1 / norm(v));
   export let scale = (v, s) => { let w = []; for (let i=0 ; i<v.length ; i++) w.push(s*v[i]); return w; }

// NOISE METHOD

   export let noise = (new function() {
   let p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
   for (let i = 0 ; i < 256 ; i++) p.push(p[i]);
   let fade = t => t * t * t * (t * (t * 6 - 15) + 10);
   let lerp = (t,a,b) => a + t * (b - a);
   let grad = (hash, x,y,z) => {
      let h = hash & 15, u = h < 8 || h == 12 || h == 13 ? x : y,
                         v = h < 4 || h == 12 || h == 13 ? y : z;
      return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
   }
   this.noise = (x,y,z) => {
         let X = floor(x) & 255, u = fade(x -= floor(x)),
             Y = floor(y) & 255, v = fade(y -= floor(y)),
             Z = floor(z) & 255, w = fade(z -= floor(z)),
             A = p[X    ] + Y, AA = p[A] + Z, AB = p[A + 1] + Z,
             B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
      return lerp(w, lerp(v, lerp(u, grad(p[AA    ], x, y    , z    ), grad(p[BA    ], x - 1, y    , z    )),
                             lerp(u, grad(p[AB    ], x, y - 1, z    ), grad(p[BB    ], x - 1, y - 1, z    ))),
                     lerp(v, lerp(u, grad(p[AA + 1], x, y    , z - 1), grad(p[BA + 1], x - 1, y    , z - 1)),
                             lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
   }
}).noise;

// MATRIX METHODS

export let mAimX = X => {
   X = normalize(X);
   let Y0 = cross([0,0,1], X), t0 = dot(Y0,Y0), Z0 = cross(X, Y0),
       Y1 = cross([1,1,0], X), t1 = dot(Y1,Y1), Z1 = cross(X, Y1),
       t = t1 / (4 * t0 + t1),
       Y = normalize(mix(Y0, Y1, t)),
       Z = normalize(mix(Z0, Z1, t));
   return [ X[0],X[1],X[2],0, Y[0],Y[1],Y[2],0, Z[0],Z[1],Z[2],0, 0,0,0,1 ];
}

export let mAimY = Y => {
   Y = normalize(Y);
   let Z0 = cross([1,0,0], Y), t0 = dot(Z0,Z0), X0 = cross(Y, Z0),
       Z1 = cross([0,0,1], Y), t1 = dot(Z1,Z1), X1 = cross(Y, Z1),
       t = t1 / (4 * t0 + t1),
       Z = normalize(mix(Z0, Z1, t)),
       X = normalize(mix(X0, X1, t));
   return [ X[0],X[1],X[2],0, Y[0],Y[1],Y[2],0, Z[0],Z[1],Z[2],0, 0,0,0,1 ];
}

export let mAimZ = Z => {
   Z = normalize(Z);
   let X0 = cross([0,1,0], Z), t0 = dot(X0,X0), Y0 = cross(Z, X0),
       X1 = cross([1,0,0], Z), t1 = dot(X1,X1), Y1 = cross(Z, X1),
       t = t1 / (4 * t0 + t1),
       X = normalize(mix(X0, X1, t)),
       Y = normalize(mix(Y0, Y1, t));
   return [ X[0],X[1],X[2],0, Y[0],Y[1],Y[2],0, Z[0],Z[1],Z[2],0, 0,0,0,1 ];
}

export let mHitRect = (A, B) => {
   let L = [[0,0,1,0],[1,0,0,1],[-1,0,0,1],[0,1,0,1],[0,-1,0,1]];
   let M = mTranspose(mMultiply(mInverse(B), A));
   for (let i = 0 ; i < L.length ; i++)
      L[i] = mTransform(M, L[i]);
   let z = -L[0][3] / L[0][2];
   if (z > 0)
      return null;
   let F = i => z * L[i][2] + L[i][3];
   for (let i = 1 ; i < L.length ; i++)
      if (F(i) < 0)
         return null;
   return [F(1)/2, F(3)/2];
}

export let mIdentity = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

export let mInverse = src => {
  let dst = [], det = 0, cofactor = (c, r) => {
     let s = (i, j) => src[c+i & 3 | (r+j & 3) << 2];
     return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                 - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                 + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
  }
  for (let n = 0 ; n < 16 ; n++) dst.push(cofactor(n >> 2, n & 3));
  for (let n = 0 ; n <  4 ; n++) det += src[n] * dst[n << 2];
  for (let n = 0 ; n < 16 ; n++) dst[n] /= det;
  return dst;
}

export let mMultiply = (a,b) => {
   let m = [];
   for (let col = 0 ; col < 4 ; col++)
   for (let row = 0 ; row < 4 ; row++) {
      let value = 0;
      for (let i = 0 ; i < 4 ; i++)
         value += a[4*i + row] * b[4*col + i];
      m.push(value);
   }
   return m;
}

export let mRotateX = theta => {
   let m = mIdentity();
   m[ 5] =  Math.cos(theta);
   m[ 6] =  Math.sin(theta);
   m[ 9] = -Math.sin(theta);
   m[10] =  Math.cos(theta);
   return m;
}

export let mRotateY = theta => {
   let m = mIdentity();
   m[10] =  Math.cos(theta);
   m[ 8] =  Math.sin(theta);
   m[ 2] = -Math.sin(theta);
   m[ 0] =  Math.cos(theta);
   return m;
}

export let mRotateZ = theta => {
   let m = mIdentity();
   m[ 0] =  Math.cos(theta);
   m[ 1] =  Math.sin(theta);
   m[ 4] = -Math.sin(theta);
   m[ 5] =  Math.cos(theta);
   return m;
}

export let mPerspective = fl => [ 1,0,0,0, 0,1,0,0, 0,0,-1,-1/fl, 0,0,-1,0 ];

export let mScale = (x,y,z) => {
   if (y === undefined)
      if (Array.isArray(x)) {
         z = x[2];
         y = x[1];
         x = x[0];
      }
      else
         y = z = x;
   let m = mIdentity();
   m[ 0] = x;
   m[ 5] = y;
   m[10] = z;
   return m;
}

export let mTransform = (m,p) => {
   let x = p[0], y = p[1], z = p[2], w = p[3] === undefined ? 1 : p[3];
   let q = [ m[0]*x + m[4]*y + m[ 8]*z + m[12]*w,
             m[1]*x + m[5]*y + m[ 9]*z + m[13]*w,
             m[2]*x + m[6]*y + m[10]*z + m[14]*w,
             m[3]*x + m[7]*y + m[11]*z + m[15]*w ];
   return p[3] === undefined ? [ q[0]/q[3],q[1]/q[3],q[2]/q[3] ] : q;
}

export let mTranslate = (x,y,z) => {
   if (y === undefined) {
      z = x[2];
      y = x[1];
      x = x[0];
   }
   let m = mIdentity();
   m[12] = x;
   m[13] = y;
   m[14] = z;
   return m;
}

export let mTranspose = m => [ m[0],m[4],m[ 8],m[12],
                               m[1],m[5],m[ 9],m[13],
                               m[2],m[6],m[10],m[14],
                               m[3],m[7],m[11],m[15] ];

