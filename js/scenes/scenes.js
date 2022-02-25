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
         { name: "DemoCamera" , path: "./demoCamera.js"  },
         { name: "DemoCube"   , path: "./demoCube.js"    },
         { name: "DemoCube2"  , path: "./demoCube2.js"   },
         { name: "DemoDots"   , path: "./demoDots.js"    },
         { name: "DemoHUD"    , path: "./demoHUD.js"     },
         { name: "DemoLabel"  , path: "./demoLabel.js"   },
         { name: "DemoGLTF"   , path: "./demoGLTF.js"    },
      ]
   };
}
