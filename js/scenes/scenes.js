import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {

   global.scene().addNode(new Gltf2Node({
      url: "./media/gltf/60_fifth_ave/60_fifth_ave.gltf"
   }));

   return {
      enableSceneReloading: true,
      scenes: [
         { name: "Demo4D"     , path: "./demo4D.js"      },
         { name: "DemoBlobs"  , path: "./demoBlobs.js"   },
         { name: "DemoCB"     , path: "./demoCB.js"      },
         { name: "DemoCube"   , path: "./demoCube.js"    },
         { name: "DemoDots"   , path: "./demoDots.js"    },
         { name: "DemoHitRect", path: "./demoHitRect.js" },
         { name: "DemoLabel"  , path: "./demoLabel.js"   },
         { name: "DemoRussels", path: "./russels.js" },
      ]
   };
}
