import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {

   global.scene().addNode(new Gltf2Node({
      url: "./media/gltf/60_fifth_ave/60_fifth_ave.gltf"
   }));

   return {
      enableSceneReloading: true,
      scenes: [
         { name: "Demo4D"         , path: "./demo4D.js"         },
         { name: "DemoBlobs"      , path: "./demoBlobs.js"      },
         { name: "DemoCube"       , path: "./demoCube.js"       },
         { name: "DemoDots"       , path: "./demoDots.js"       },
         { name: "DemoGLTF"       , path: "./demoGLTF.js"       },
         { name: "DemoGreenThumb" , path: "./demoGreenThumb.js" },
         { name: "DemoHUD"        , path: "./demoHUD.js"        },
         { name: "DemoLabel"      , path: "./demoLabel.js"      },
         { name: "DemoNoisyCube"  , path: "./demoNoisyCube.js"  },
         { name: "DemoNoisySphere", path: "./demoNoisySphere.js"},
         { name: "DemoRayTrace"   , path: "./demoRayTrace.js"   },
         { name: "DemoZoom"       , path: "./demoZoom.js"       },
         { name: "DemoDesktopHand", path: "./demoDesktopHand.js"},
      ]
   };
}
