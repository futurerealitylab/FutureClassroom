import { Gltf2Node } from "../../nodes/gltf2.js";
import { demoCube } from "./demoCube.js";

let currentModel = null;
let loadGLTF = false;
let defaultBackground = "./media/gltf/60_fifth_ave/60_fifth_ave.gltf";

export let clayModels = function () {

    if (!loadGLTF) {
        window.scene.addNode(new Gltf2Node({ url: defaultBackground })).name =
          "backGround";
        loadGLTF = true;
      }

    if (demoDemoCubeState % 2) loadModel(demoCube); else stopModel(demoCube);
}

function loadModel(model) {
  if(!model.start) {
      // default : remove all the previous models when starting a new one
      // might be useful to change this into something else if want to show more models at once
      clay.model.clear(); 
      model.init(clay);
      currentModel = model;
  } 
  model.display();
}

function stopModel(model) {
    model.start = false;
    if(currentModel == model) {
        clay.model.clear();
        currentModel = null;
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

window.demoNames = "DemoCube";
addDemoButtons(window.demoNames);
window.addNameField();