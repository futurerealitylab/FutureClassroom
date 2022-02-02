import { Gltf2Node } from "../render/nodes/gltf2.js";
import { demoController } from "./demoController.js";

let currentDemo = null;
let loadGLTF = false;
let defaultBackground = "./media/gltf/60_fifth_ave/60_fifth_ave.gltf";

export let scenes = function () {

    if (!loadGLTF) {
        window.scene.addNode(new Gltf2Node({ url: defaultBackground })).name =
          "backGround";
        loadGLTF = true;
      }

    if (demoDemoControllerState % 2) loadDemo(demoController); else stopDemo(demoController);
}

function loadDemo(demo) {
  if(!demo.start) {
      // default : remove all the previous demos when starting a new one
      // might be useful to change this into something else if want to show more demos at once
      clay.model.clear(); 
      demo.init(clay.model);
      currentDemo = demo;
  } 
  demo.display();
}

function stopDemo(demo) {
  demo.start = false;
    if(currentDemo == demo) {
        clay.model.clear();
        currentDemo = null;
    }
}

function showNameTag() {
    for (let key in window.avatars) {
      if (window.playerid && window.playerid != window.avatars[key].playerid && window.avatars[key].headset.matrix[0] != undefined) {
        let msg = window.avatars[key].name; // user's name
        let mat = []; // the transformation matrix for the user
        for (let i = 0; i < 16; i++) {
            mat.push(window.avatars[key].headset.matrix[i])
        }
        // TODO: after implementing the text display system in clay, add name tag rendering for each remote user
      }
    }
  }

window.demoNames = "DemoController";
addDemoButtons(window.demoNames);
window.addNameField();