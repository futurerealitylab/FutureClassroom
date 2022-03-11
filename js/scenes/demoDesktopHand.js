import { HandSize } from "../render/core/handSize.js";

let handSize = new HandSize();

export const init = async model => {
    let F2G = [0,1,2,3,4, 0,5,6,7,8, 0,9,10,11,12, 0,13,14,15,16, 0,17,18,19,20 ];
    let G2F = [0,1,2,3,4,  6,7,8,9,  11,12,13,14,  16,17,18,19,  21,22,23,24 ];

    let X = [0,0];
    let leftIndex  = () => X[0] < X[1] ? 1 : 0;
    let rightIndex = () => X[0] < X[1] ? 0 : 1;

    let getFingerMatrix = (hand,finger,j) =>
       joint[hand == 'left' ? leftIndex() : rightIndex()][F2G[5*finger+j]].mesh.getGlobalMatrix();

    model.setTable(false);
    const jointNum = 21;
    let joint = [[],[]];
    let jointMatrix = [[],[]];

    for (let i = 0; i < 2; i ++)
       for (let j = 0; j < jointNum; j ++)
          joint[i][j] = { mesh: model.add('tubeZ').color(1,0,0),
	                  detected: false,
			  position: [0,0,0] };

    model.animate(() => {
        if (! window.vr) {
	    model.setMatrix(model.viewMatrix()).move(0,0,-1).turnZ(Math.PI).scale(.53,.4,1);

            for (let i = 0; i < window.handInfo.length; i++)
               for (let j = 0; j < jointNum; j ++) {
                  joint[i][j].detected = true;
                  joint[i][j].position = [window.handInfo[i].landmarks[j].x-.5,
		                          window.handInfo[i].landmarks[j].y-.5,
					 -window.handInfo[i].landmarks[j].z-.2];
                  joint[i][j].mesh.identity().move(joint[i][j].position);
               } 

            for (let i = 0 ; i < 2 ; i++) {
               let pose = [];
               for (let j = 0 ; j < jointNum ; j++)
	          pose.push(joint[i][j].position);
               let size = handSize.compute(pose);

               X[i] = 0;
               for (let j = 0 ; j < jointNum ; j++)
	          X[i] += joint[i][j].position[0];

               for (let j = 0; j < jointNum; j ++) {
	          let k = G2F[j] % 5;
	          let j1 = k < 4 ? j+1 : j;
	          let j0 = j1 - (k == 2 || k == 3 ? 2 : 1);
		  if (j == 0) { j0 = 0; j1 = 9; }
		  let a = joint[i][j0].position;
		  let b = joint[i][j1].position;
	 	  let d = [ b[0] - a[0], b[1] - a[1], b[2] - a[2] ];
                  joint[i][j].mesh.aimZ(d)
		             .scale(joint[i][j].detected ? j==0 ? [.02,.026,.026]
		                                         : [.01,.013,.013] : 0).scale(size);
               }
            }
        }
    });
 }
