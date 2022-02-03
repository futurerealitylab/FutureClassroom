import { cg } from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

let Demo4D = function() {

   let isAnimating, isBold, isColors, M, C = [],
       E = [ 0,2,4,6,8,10,12,14, 0,1,4,5,8,9,12,13,
             0,1,2,3,8, 9,10,11, 0,1,2,3,4,5, 6, 7 ];

   for (let n = 0 ; n < 16 ; n++)
      C.push([ (n&1)*2-1, (n/2&1)*2-1, (n/4&1)*2-1, (n/8&1)*2-1 ]);

   let rotate4D = (i,j,theta) => {
      let R = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
      R[i | i<<2] =  Math.cos(theta);
      R[i | j<<2] =  Math.sin(theta);
      R[j | i<<2] = -Math.sin(theta);
      R[j | j<<2] =  Math.cos(theta);
      M = cg.mMultiply(M, R);
   }

   this.init = model => {
      model.control('A', 'animate', () => isAnimating = ! isAnimating);
      model.control('B', 'bold'   , () => isBold      = ! isBold     );
      model.control('C', 'colors' , () => isColors    = ! isColors   );

      for (let n = 0 ; n < E.length ; n++) model.add().add('tubeZ');
      for (let n = 0 ; n < C.length ; n++) model.add().add('sphere');

      M = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
      isAnimating = isBold = isColors = false;
   }

   this.display = model => {
      model.animate(() => {

         // GET DATA FROM MY LEFT CONTROLLER

         let leftMatrix   = controllerMatrix.left;
         let leftTrigger  = buttonState.left[0].pressed;
         let leftSqueeze  = buttonState.left[1].pressed;
         let leftJoyTouch = buttonState.left[3].touched;
         let leftJoyPress = buttonState.left[3].pressed;
         let X            = buttonState.left[4].pressed;
         let Y            = buttonState.left[5].pressed;
         let leftJoyX     = joyStickState.left.x;
         let leftJoyY     = joyStickState.left.y;

         // GET DATA FROM MY RIGHT CONTROLLER

         let rightMatrix   = controllerMatrix.right;
         let rightTrigger  = buttonState.right[0].pressed;
         let rightSqueeze  = buttonState.right[1].pressed;
         let rightJoyTouch = buttonState.right[3].touched;
         let rightJoyPress = buttonState.right[3].pressed;
         let A             = buttonState.right[4].pressed;
         let B             = buttonState.right[5].pressed;
         let rightJoyX     = joyStickState.right.x;
         let rightJoyY     = joyStickState.right.y;

         let color = leftTrigger  ? [1,0,0] :
	             rightTrigger ? [0,1,0] : [0,0,0];

         if (isAnimating) {
            rotate4D(0, 3, .43 * model.deltaTime);
            rotate4D(0, 2, .46 * model.deltaTime);
            rotate4D(1, 2, .49 * model.deltaTime);
         }
	 let r = isBold ? .15 : .05;
         model.identity()
	      .move(0,1.5,0)
	      .scale(.2);
         for (let n = 0 ; n < E.length ; n++) {
            let A = C[E[n]],
                B = C[E[n] | 1 << (n >> 3)],
	        x = B[0]>A[0], y = B[1]>A[1], z = B[2]>A[2], w = !(x|y|z),
                a = cg.mTransform(M,A),
	        b = cg.mTransform(M,B),
	        d = cg.mix(a,b,-1,1);
	    model.child(n).color(isColors ? [x|w,y|w,z|w] : color)
	                  .identity()
	                  .move(cg.mix(a,b,.5))
                          .aimZ(d)
			  .scale(r,r,cg.norm(d)/2);
	 }
         for (let n = 0 ; n < C.length ; n++)
	    model.child(E.length + n).color(0,0,0)
	                             .identity()
				     .move(cg.mTransform(M,C[n]))
				     .scale(1.5*r);
      });
   }
}

export let demo4D
 = new Demo4D();
