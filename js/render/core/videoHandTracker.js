import { HandSize } from "./handSize.js";
import * as cg from "./cg.js";

function VideoHandTracker() {
   let F2G = [0,1,2,3,4, 0,5,6,7,8, 0,9,10,11,12, 0,13,14,15,16, 0,17,18,19,20 ];
   let G2F = [0,1,2,3,4,  6,7,8,9,  11,12,13,14,  16,17,18,19,  21,22,23,24 ];

   let X0 = [0,0], X = [0,0], count = [0,0];
   let leftIndex  = () => X[0] < X[1] ? 1 : 0;
   let rightIndex = () => X[0] < X[1] ? 0 : 1;

   this.jointMatrix = (i,j) => joint[i][j].matrix;

   let getFingerMatrix = (hand,finger,j) =>
      joint[hand == 'left' ? leftIndex() : rightIndex()][F2G[5*finger+j]].matrix;

   let joint = [[],[]];

   let px = null, py = null;

   for (let i = 0 ; i < 2 ; i++)
      for (let j = 0 ; j < 21 ; j++)
         joint[i][j] = { matrix: cg.mIdentity(),
                         detected: false,
                         position: [0,0,0] };

   let matrix = cg.mIdentity();
   let handSize = new HandSize();

   this.update = () => {
      if (! window.vr) {
          matrix = cg.mInverse(views[0]._viewMatrix);
          matrix = cg.mMultiply(matrix, cg.mTranslate(0,0,-1));
          matrix = cg.mMultiply(matrix, cg.mRotateZ(Math.PI));
          matrix = cg.mMultiply(matrix, cg.mScale(.432,.319,1));

          for (let i = 0; i < window.handInfo.length; i++)
             for (let j = 0 ; j < 21 ; j++) {
                joint[i][j].detected = true;
                joint[i][j].position = [window.handInfo[i].landmarks[j].x-.5,
                                        window.handInfo[i].landmarks[j].y-.5,
                                       -window.handInfo[i].landmarks[j].z-.2];
                joint[i][j].matrix = cg.mTranslate(joint[i][j].position);
             } 

          for (let i = 0 ; i < 2 ; i++) {
             let pose = [];
             for (let j = 0 ; j < 21 ; j++)
                pose.push(joint[i][j].position);
             let size = handSize.compute(pose);

             X[i] = 0;
             for (let j = 0 ; j < 21 ; j++)
                X[i] += joint[i][j].position[0];

             for (let j = 0 ; j < 21 ; j++) {
                let k = G2F[j] % 5;
                let j1 = k < 4 ? j+1 : j;
                let j0 = j1 - (k == 2 || k == 3 ? 2 : 1);
                if (j == 0) { j0 = 0; j1 = 9; }
                let a = joint[i][j0].position;
                let b = joint[i][j1].position;
                 let d = [ b[0] - a[0], b[1] - a[1], b[2] - a[2] ];

                let m = joint[i][j].matrix;
                m = cg.mMultiply(m, cg.mAimZ(d));
                m = cg.mMultiply(m, cg.mScale(joint[i][j].detected ? j==0 ? [.02,.026,.026]
                                                                   : [.01,.013,.013] : 0));
                joint[i][j].matrix = cg.mMultiply(matrix,
		                                  cg.mMultiply(m, cg.mScale(size)));
             }
          }

          // IF ONE HAND IS VISIBLE, USE FOREFINGER AS A 2D CURSOR

          if (X[0] != X0[0]) count[0] = 3;
          if (X[1] != X0[1]) count[1] = 3;
	  let isTracking = (count[0]>0) != (count[1]>0);
          if (isTracking) {
             let m = joint[count[0]>0?0:1][8].matrix;
             let x = m[12]*-3200+640;
             let y = m[13]*-3200+5530;
             if (px == null) { px = x; py = y; }
             px = .5 * px + .5 * x;
             py = .5 * py + .5 * y;
	     anidraw.setTimelineInteractive(false);
             anidraw.mousemove({x:px, y:py});
	     anidraw.setTimelineInteractive(true);
          }
          X0[0] = X[0];
          X0[1] = X[1];
          count[0]--;
          count[1]--;
      }
   }
}

export let videoHandTracker = new VideoHandTracker();
