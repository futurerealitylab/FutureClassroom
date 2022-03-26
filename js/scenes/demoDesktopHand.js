import { videoHandTracker } from "../render/core/videoHandTracker.js";

export const init = async model => {
   for (let i = 0 ; i < 42 ; i++)
      model.add('tubeZ').color(1,0,0);
   model.animate(() => {
      for (let i = 0 ; i < 42 ; i++)
         model.child(i).setMatrix(videoHandTracker.jointMatrix(i/21>>0,i%21));
   });
}

