import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export const init = async model => {
    let gltf1 = new Gltf2Node({ url: './media/gltf/headset/headset.gltf' });
    let gltf2 = new Gltf2Node({ url: './media/gltf/headset/headset.gltf' });
    gltf1.addNode(gltf2);
    gltf2.matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.5,0,1];
    global.gltfRoot.addNode(gltf1);
    model.animate(() => {
       gltf1.translation = [0, 1 + .5 * Math.sin(2 * model.time), 0];
    });
 }
