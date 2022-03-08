// import globally-available sub-systems
import * as global from "./global.js";
import { ControllerBeam } from "./render/core/controllerInput.js";

window.currentName = '';
window.currentID   = -1;

// scene state

let currentDemo = null;
let scenesInit = false;
let idToScene = new Map();
let nameToScene = new Map();
let nextSceneID = 0;
let sceneNames = [];
let sceneList  = [];

export let lcb, rcb;

let enableSceneReloading = false;

const chooseFlag = name => {
   if (name == null || name == undefined) {
      return;
   }
   
   stopDemo(nameToScene.get(name));
   
   let flag = name => 'demo' + name + 'State';
   let names = global.demoNames().split(',').map(item => item.trim());
   for (let n = 0 ; n < names.length ; n++) {
      window[flag(names[n])] = name == names[n] && currentName != names[n];
   }
   if (window[flag(name)]) {
      const entry = nameToScene.get(name);
      if (entry) {
         window.currentName = name;
         window.currentID = entry.id;
      } else {
         window.currentName = '';
         window.currentID = -1;
         console.error("Scene should be valid!\n");
      }
   } else {
      window.currentName = '';
      window.currentID = -1;
   }
}
window.chooseFlag = chooseFlag;

const onReloadDefault = async (thisScene, model, ctx, ctxForever) => {
   model.clear();
   global.gltfRoot.clearNodes();
   if (thisScene.init) {
      return thisScene.init(model);
   } else {
      return;
   }
}

window.reloadCurrentScene = () => {
   // NOTE(KTR): re-adding the rapid development / live coding feature for whenever it's convenient. :)
   // enabled a flag "enableSceneReloading : true" set on the config object in scenes.js
   if (currentDemo != null) {
      console.log("reloading: ", currentDemo.name, " with modificationCount: ", currentDemo.modificationCount);
      loadScene(currentDemo).then(() => {
         const prevIsValid = currentDemo.isValid;
         if (currentDemo.world.onReload) {

            currentDemo.isValid = false;
            currentDemo.world.onReload(
               clay.model, currentDemo.ctx, currentDemo.ctxForever
            ).then(() => {
               currentDemo.isValid = prevIsValid;
            }).catch((err) => {
               console.error(err.message, err.stack);      
               console.error("error in onReload()");               
            });
         } else {
            // default behavior is to do a clean-wipe of the demo scene
            currentDemo.ctx = {};
            currentDemo.isValid = false;
            onReloadDefault(
               currentDemo.world, 
               clay.model, currentDemo.ctx, currentDemo.ctxForever
            ).then(() => {
               currentDemo.isValid = prevIsValid;
            }).catch((err) => {
               console.error(err.message, err.stack);      
               console.error("error in onReloadDefault() -> init()");
            });
         }
      }).catch((err) => {
         console.error(err.message, err.stack);
      });
   }
}

const addDemoButtons = demoNames => {
   let names = demoNames.split(',').map(item => item.trim());
   
   if (names.length == 0 || names[0] == '') {
      return;
   }

   global.setDemoNames(demoNames);

   let header = document.getElementById("header");
   window["getSceneFlagByID"] = {};
   window["setSceneFlagByID"] = {};
   for (let n = 0; n < names.length; n++) {
      let flag = 'demo' + names[n] + 'State';
      window[flag] = 0;
      window["getSceneFlagByID"]["" + n] = function() { return window[flag]; };
      window["setSceneFlagByID"]["" + n] = function(f) { window[flag] = f; };
      if (names[n] != "Speak") {
         header.innerHTML += '<button onclick=chooseFlag("' + names[n] + '");'
                 + 'window.syncDemos();>' + names[n] + '</button>';
         clay.vrWidgets.add('label').info(names[n])
	                            .move(1,1.7-n*.1,.7)
	                            .turnY(Math.PI/6)
				    .scale(.045);
      }
      else {
         header.innerHTML += '<button id=\"Speak\" onclick=\"window.' + flag + '=!window.' + flag
         + ';window.muteSelf()\">' + names[n] + '</button>';
      }
   }
   lcb = new ControllerBeam(clay.vrWidgets, 'left');
   rcb = new ControllerBeam(clay.vrWidgets, 'right');
   
   header.innerHTML += "<br>";

   // NOTE(KTR): for code-reloading during development / for permanent changes
   // for performing some code changes that should not edit the code permanently,
   // this is where we can use new Function(...) in some way
   if (enableSceneReloading) {
      // use a button
      header.innerHTML += '<button onclick=reloadCurrentScene();>Reload</button><BR>';
      // or automatically reload if you exit and re-enter the window

      window.addEventListener("focus", (event) => { 
         window.reloadCurrentScene();
      }, false);
      // or eventually the server should just tell the application when a file has changed
      // TODO: 
      // ...
   }

   const xrEntryUI = global.xrEntryUI();
   header.appendChild(xrEntryUI.domElement);
}

// registers a scene to the list
function addScene(name, path) {
   sceneNames.push(name);
   const id = nextSceneID;
   nextSceneID += 1;
   const entry = {
      // id of the scene demo
      id : id, 
      // its readable name
      name : name, 
      // local path with respect to js/scenes/
      localPath: path,
      // number of times this scene demo was modified at-runtime
      modificationCount : 1,
      // stateful context useful for live reloading,
      // refreshed on each init
      ctx : {},
      // stateful context that exists for the 
      // entire lifetime of the scene demo, even after multiple inits
      ctxForever : {}
   };
   sceneList.push(entry);

   idToScene.set(entry.id, entry);
   nameToScene.set(entry.name, entry);
}

// load scenes asynchronously via dynamic import
async function loadScene(info) {
   let wasValid = (info.isValid == true);
   if (info.isValid == undefined) {
      info.isValid = false;
   }
   // dynamically import client module code,
   // must append a unique query string to force-reload rather than use
   // a previous cached version of the file
   return import(info.localPath + "?modid=" + info.modificationCount + "_" + (Date.now() / 1000)).then((worldModule) => {
      info.world = worldModule;
      info.isValid = true;
      info.modificationCount += 1;
   }).catch((err) => {
      info.isValid = wasValid;
      console.error(err.message, err.stack);
   });
}

// initialize the scene system

const rootPath = "./scenes/";
async function init() {
   return import("./scenes/scenes.js").then((userInitNamespace) => {
      let params = null;      
      if (!userInitNamespace.default) {
         console.warn("No user initialization procedure specified!");
      } else {
         params = userInitNamespace.default();
      }

      if (params) {
         if (params.scenes) {
            if (!Array.isArray(params.scenes)) {
               console.error("Invalid parameter to init(): expected scenes of type Array", params.scenes);
            } else {
               try {
                  const initSceneCount = params.scenes.length;
                  for (let i = 0; i < initSceneCount; i += 1) {
                     addScene(params.scenes[i].name, rootPath + params.scenes[i].path);
                  }
                  // load asynchronously
                  for (let i = 0; i < sceneList.length; i += 1) {
                     loadScene(sceneList[i]);
                  }
               } catch (err) {
                  console.error(err.message, "invalid parameters to addScene(name, path)");
               }
            }
         }

         if (params.enableSceneReloading != undefined) {
            enableSceneReloading = params.enableSceneReloading;
         }
      }

   }).catch((err) => {
      console.error(err);
   }).finally(() => {
      const demoNames = sceneNames.join(",");
      global.setDemoNames(demoNames);
      addDemoButtons(demoNames);
      scenesInit = true;
   });
}

init();

export let scenes = function () {
   if (!scenesInit || window.currentID == -1) {
      return;
   }

   const demoInfo = sceneList[window.currentID];
   if (demoInfo.isValid && window.getSceneFlagByID[window.currentID]() != 0) { 
      runDemo(demoInfo); 
   }
}

function runDemo(demo) {
   if(! demo._isStarted) {
      currentDemo = demo;
      // default : remove all the previous demos when starting a new one
      // might be useful to change this into something else if want to show more demos at once
      clay.model.clear();
      global.gltfRoot.clearNodes();
      clay.model.setUniform('1i', 'uProcedure', 0);


      demo.ctx = {};

      if (!demo.world.init) {
         console.warn(window.currentName, "has no init function");
         if (!demo.world.display) {
            console.warn(window.currentName, "has no display function");
         }
         demo._isReady = true;
      } else {
         // This try/catch is necessary because we don't know if the init 
         // function is async 
         let errIsNotAsync = true;
         try {
            // Additionally, there might be an error in the scene code. Catch it here.
            // There also might or might not be pending asynchronous initialization tasks that
            // Should complete starting the run loop

            let initStatus = demo.world.init(clay.model, demo.ctx, demo.ctxForever);
            initStatus.then(() => {
               demo._isReady = true;
            }).catch((err) => {
               console.error(err.message, err.stack);
               console.error("Leaving:", window.currentName);
               window.chooseFlag(window.currentName);
               return;
            });
            errIsNotAsync = false;
         } catch (err) {
            if (errIsNotAsync) {
               console.warn("init() should be async!");
            } else {
               console.error(err.message, err.stack);
               console.error("client code has runtime errors in init()!\n:Leaving:", window.currentName);
               window.chooseFlag(window.currentName);
               return;
            }
         }
         
         demo._isReady = true;
         if (!demo.world.display) {
            // console.warn("no display function");
         }
      }

      demo._isStarted = true;
      
   } 

   if (demo._isReady && demo.world.display) {
      try {
         demo.world.display(clay.model, demo.ctx, demo.ctxForever);
      } catch (err) {
         console.error(err.message, err.stack);
         console.error("client code has runtime errors in display()!");
         //window.chooseFlag(window.currentName);
      }
   }
}

function stopDemo(demo) {
   demo._isStarted = false;
   demo._isReady = false;
   if(currentDemo == demo) {
      if (demo.isValid && demo.world.deinit) {
         try {
            // deinitialize any resources that the scene loaded
            // separately from the system
            demo.world.deinit(clay.model, demo.ctx, demo.ctxForever);
         } catch (err) {
            console.error(err.message, err.stack);
            console.error("client code has runtime errors in deinit()!");
         }
      }
      clay.model.clear();
      global.gltfRoot.clearNodes();
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
