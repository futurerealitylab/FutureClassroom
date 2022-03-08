/*
   This demo shows how you can use the model.deltaTime parameter
   to do simple physics simulations, iteratively advancing the
   simulation at each animation frame based on how much time
   has advanced since the previous animation frame.
*/

import * as cg from "../render/core/cg.js";

export const init = async model => {

   // SPECIFY THE NUMBER OF DOTS

   let N = 100;

   // USE A MONTE CARLO METHOD TO GENERATE UNIFORMLY RANDOM DOTS ON A SPHERE

   let generatePoint = () => {
      let x = 1, y = 1, z = 1;
      while (x*x + y*y + z*z > 1) {
         x = 2 * Math.random() - 1;
         y = 2 * Math.random() - 1;
         z = 2 * Math.random() - 1;
      }
      return cg.normalize([x,y,z]);
   }

   // GENERATE ALL THE DOTS AND THEIR COLORS

   let P = [], C = [];
   for (let n = 0 ; n < N ; n++) {
      P.push(generatePoint());
      C.push([Math.random() > .5, Math.random() > .5, Math.random() > .5]);
   }

   // COMPUTE THE OPTIMAL DISTANCE BETWEEN NEIGHBORING DOTS

   let r = Math.sqrt(4 * Math.PI / N);

   // CREATE THE DOTS GEOMETRY

   model.move(0,1.5,0).scale(.5);
   for (let n = 0 ; n < N ; n++)
      model.add('tubeZ').color(C[n]);

   // AT EACH ANIMATION FRAME

   model.animate(() => {
      let rr = r*r;

      // REPEL ALL THE DOTS FROM EACH OTHER

      for (let i = 0 ; i < N ; i++)
      for (let j = 0 ; j < N ; j++)
         if (j != i) {
            let p = P[i];
            let q = P[j];
            let d = cg.mix(p, q, -1, 1);
            let dd = cg.dot(d, d);
            if (dd < rr / 4)
               P[j] = generatePoint();
            else if (dd < rr) {
               P[i] = cg.mix(p, d, 1, .5 * (dd - rr) / rr);
               P[j] = cg.mix(q, d, 1, .5 * (rr - dd) / rr);
            }
         }

      // THEN SWIRL THE DOTS WITHIN THE SPHERE SURFACE

      let s = [ Math.sin(model.time              ),
                Math.sin(model.time + Math.PI/3  ),
                Math.sin(model.time + Math.PI/3*2) ];
      for (let n = 0 ; n < N ; n++) {
         for (let j = 0 ; j < 3 ; j++)
            P[n][j] += s[j] * (2 * C[n][j] - 1) * model.deltaTime / 2;
	 P[n] = cg.normalize(P[n]);
      }

      // RENDER EACH DOT AS A FLAT DISK ORIENTED TOWARD THE SPHERE SURFACE

      for (let n = 0 ; n < N ; n++)
         model.child(n).identity().move(P[n]).aimZ(P[n]).scale(r/4,r/4,.0001);
   });
}
