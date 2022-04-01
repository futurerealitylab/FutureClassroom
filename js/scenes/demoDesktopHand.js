import { videoHandTracker } from "../render/core/videoHandTracker.js";
import * as cg from "../render/core/cg.js";

export const init = async model => {
   let isInfo = true;
   let handState = [null, null];
   let ballIndex = -1, ball = [], radius = .02; window.ball = ball;
   let showColorPalette = false;
   let colorPalette = [[1, 1, 1], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1], [1, 0, 1]];
   let colorRect = n => [700 + 70 * n, 100, 70, 70];
   let isCreating = false;
   let isJoints = true;
   let isMirror = true;
   let prevFingerTouches = '';
   let infoText = '';

   let pointToPixel = p => {
      let x = p[0] * -3200 + 640;
      let y = p[1] * -3200 + 5530;
      let z = p[2] * -3200;
      return [x, y, z];
   }

   let jointToPixel = (hand, f, j) => {
      let m = videoHandTracker.getJointMatrix(hand, f, j).slice(12, 15);
      return pointToPixel(m);
   }

   model.control('c', 'create', () => isCreating = !isCreating);
   model.control('i', 'info', () => isInfo = !isInfo);
   model.control('j', 'joints', () => isJoints = !isJoints);
   model.control('m', 'mirror', () => isMirror = !isMirror);

   anidraw.setDrawFunction(context => {
      if (!isInfo)
         return;

      videoHandTracker.setMirror(isMirror);

      if (showColorPalette) {
         for (let n = 0; n < colorPalette.length; n++) {
            let color = colorPalette[n];
            let r = color[0] ? 'ff' : '00';
            let g = color[1] ? 'ff' : '00';
            let b = color[2] ? 'ff' : '00';
            context.fillStyle = '#' + r + g + b;
            let R = colorRect(n);
            context.fillRect(R[0], R[1], R[2], R[3]);
         }
      }

      if (isInfo) {
         let s = infoText.split('\n');
	 for (let n = 0 ; n < s.length ; n++)
            anidraw.textLabel(context,s[n],[20,500+30*n],30,5,'courier','#00000000','black');
      }
/*
      // EXAMPLE OF A TEXT LABEL

      anidraw.textLabel(context,'This is a text label',[300,500],30,5,'courier','white','black');

      // EXAMPLE OF A BAR CHART SHOWING FINGER Y VALUES

      let x = context.width/2, y = context.height/2, table = [];
      for (let h = 0 ; h < 2 ; h++) {
         let hand = h==0 ? 'left' : 'right';
         for (let f = 0 ; f < 5 ; f++) {
            let m = videoHandTracker.getJointMatrix(hand, f, 4);
	    table.push(m[13]);
         }
      }
      context.fillStyle = 'black';
      for (let n = 0 ; n < 10 ; n++) {
         let h = Math.max(0, 500 * (table[n] - 1.45)); 
         context.fillRect(x-5*10+(n<5?5-n:n)*10+(n>4?20:0), y-260-h, 5, h);
      }

      // EXAMPLE OF 2D SQUARES TRACKING FOREFINGER TIPS

      if (ballIndex >= 0) {
         let p0 = jointToPixel('left', 1, 4);
         context.fillStyle = 'green';
	 context.fillRect(p0[0]-20,p0[1]-20+40,40,40);

         let p1 = jointToPixel('right', 1, 4);
         context.fillStyle = 'red';
	 context.fillRect(p1[0]-20,p1[1]-20+40,40,40);
      }
*/
   });

   for (let h = 0; h < 2; h++) {
      for (let f = 0; f < 5; f++)
         for (let j = 0; j < 5; j++)
            model.add('tubeZ').color(1, .5, .5);
   }

   model.animate(() => {
      window.interactMode = isInfo ? 2 : 0;
      infoText = '';
      let prevHandState = handState.slice();
      for (let h = 0; h < 2; h++) {
         let hand = h == 0 ? 'left' : 'right';
         for (let f = 0; f < 5; f++)
            for (let j = 0; j < 5; j++) {
               let m = videoHandTracker.getJointMatrix(hand, f, j);
               model.child(h * 25 + f * 5 + j).setMatrix(m);
            }
         handState[h] = videoHandTracker.getHandPose(hand);
         infoText += hand + (h==0 ? ' : ' : ': ') + handState[h] + '\n';
      }

      let fingerTouches = videoHandTracker.getFingerTouches();
      infoText += fingerTouches + '\n';

      if (prevFingerTouches === '0-0 1-1 ' && fingerTouches !== prevFingerTouches)
         isCreating = ! isCreating;
      prevFingerTouches = fingerTouches;

      if (isCreating) {
         let isLeftClick = prevHandState[0] == 'pinch' && handState[0] != 'pinch';
         let isRightClick = prevHandState[1] == 'pinch' && handState[1] != 'pinch';

         if (isLeftClick) {
            let nNear = -1, dNear = 1000;
            let p = jointToPixel('left', 1, 4);
            for (let n = 0; n < ball.length; n++) {
               let q = pointToPixel(ball[n].getMatrix().slice(12, 15));
               let d = cg.norm(cg.mix(p, q, -1, 1));
               if (d < dNear) {
                  dNear = d;
                  nNear = n;
               }
            }
            if (nNear >= 0) {
               model.remove(ball[nNear]);
               ball.splice(nNear, 1);
            }
         }

         else if (isRightClick) {
            if (ballIndex == -1) {
               ballIndex = ball.length;
               ball.push(model.add('sphere').scale(0));
            }
            else {
               ballIndex = -1;
            }
         }

         showColorPalette = handState[1] == 'point';

         if (ballIndex >= 0) {
            let a = videoHandTracker.getJointMatrix('left', 0, 4).slice(12, 15);
            let b = videoHandTracker.getJointMatrix('left', 1, 4).slice(12, 15);
            let c = cg.mix(a, b, .5, .5);
            let d = cg.mix(a, b, -.5, .5);
            radius = .9 * radius + .1 * (cg.norm(d) - .005);
            ball[ballIndex].identity().move(c).scale(radius);

            if (showColorPalette) {
               let p = jointToPixel('right', 1, 4);
               for (let n = 0; n < colorPalette.length; n++) {
                  let R = colorRect(n);
                  if (p[0] >= R[0] && p[0] < R[0] + R[2] &&
                     p[1] >= R[1] && p[1] < R[1] + R[3])
                     ball[ballIndex].color(colorPalette[n]);
               }
            }
         }
	 infoText += 'create mode';
      }

      if (!isJoints)
         for (let h = 0; h < 2; h++)
            for (let f = 0; f < 5; f++)
               for (let j = 0; j < 5; j++)
                  model.child(h * 25 + f * 5 + j).scale(0);
   });
}

