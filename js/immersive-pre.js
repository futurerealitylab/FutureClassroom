import { WebXRButton } from "./util/webxr-button.js";
import * as global from "./global.js";
import { Renderer, createWebGLContext } from "./render/core/renderer.js";
import { Gltf2Node } from "./render/nodes/gltf2.js";
import { Node } from './render/core/node.js';
import { mat4, vec3 } from "./render/math/gl-matrix.js";
import { Ray } from "./render/math/ray.js";
import { InlineViewerHelper } from "./util/inline-viewer-helper.js";
import { QueryArgs } from "./util/query-args.js";
import { EventBus } from "./primitive/eventbus.js";
import * as DefaultSystemEvents from "./primitive/event.js";
// import {
//     loadAudioSources,
//     updateAudioSources,
//     updateAudioNodes,
//     stereo,
//     resonance,
//     audioSources,
//     pauseAudio,
// } from "./util/positional-audio.js";
import { Client as WSClient } from "./util/websocket-client.js";
import { updateController } from "./render/core/controllerInput.js";
import * as keyboardInput from "./util/input_keyboard.js";
import { InputController } from "./util/input_controller.js";
import { corelink_message } from "./util/corelink_sender.js"
import { metaroomSyncSender } from "./corelink_handler.js"
import { Clay } from "./render/core/clay.js";
import { BoxBuilder } from './render/geometry/box-builder.js';
import { PbrMaterial } from './render/materials/pbr.js';
window.wsport = 8447;
window.vr = false;
window.handtracking = false;
window.interactMode = 0;
window.model = 0;

// If requested, use the polyfill to provide support for mobile devices
// and devices which only support WebVR.
import WebXRPolyfill from "./third-party/webxr-polyfill/build/webxr-polyfill.module.js";
import { updateObject } from "./util/object-sync.js";
import { updateHandtracking } from "./render/core/handtrackingInput.js";
if (QueryArgs.getBool("usePolyfill", true)) {
    let polyfill = new WebXRPolyfill();
}

// XR globals.
let xrButton = null;
let xrImmersiveRefSpace = null;
let inlineViewerHelper = null;
let inputController = null;
let time = 0;

// WebGL scene globals.
let gl = null;
let renderer = null;

let radii = new Float32Array(25);
let positions = new Float32Array(16*25);
// Boxes
let boxes_left = [];
let boxes_right = [];
let boxes = { left: boxes_left, right: boxes_right };
let indexFingerBoxes = { left: null, right: null };
const defaultBoxColor = {r: 0.5, g: 0.5, b: 0.5};
const leftBoxColor = {r: 1, g: 0, b: 1};
const rightBoxColor = {r: 0, g: 1, b: 1};
let interactionBox = null;
let leftInteractionBox = null;
let rightInteractionBox = null;

function initModels() {
    window.models = {};
/*
    window.models["stereo"] = new Gltf2Node({
        url: "./media/gltf/stereo/stereo.gltf",
    });
    window.models["stereo"].visible = true;
    */
    // global.scene().addNode(window.models['stereo']);
}

global.scene().standingStats(true);
// global.scene().addNode(window.models['stereo']);

function createBoxPrimitive(r, g, b) {	
    let boxBuilder = new BoxBuilder();	
    boxBuilder.pushCube([0, 0, 0], 1);	
    let boxPrimitive = boxBuilder.finishPrimitive(renderer);	
    let boxMaterial = new PbrMaterial();	
    boxMaterial.baseColorFactor.value = [r, g, b, 1];	
    return renderer.createRenderPrimitive(boxPrimitive, boxMaterial);	
  }

  function addBox(x, y, z, r, g, b, offset) {
    let boxRenderPrimitive = createBoxPrimitive(r, g, b);
    let boxNode = new Node();
    boxNode.addRenderPrimitive(boxRenderPrimitive);
    // Marks the node as one that needs to be checked when hit testing.
    boxNode.selectable = true;
    return boxNode;
  }

  function initHands() {
    for (const box of boxes_left) {
      global.scene().removeNode(box);
    }
    for (const box of boxes_right) {
      global.scene().removeNode(box);
    }
    boxes_left = [];
    boxes_right = [];
    boxes = { left: boxes_left, right: boxes_right };
    if (typeof XRHand !== 'undefined') {
      for (let i = 0; i <= 24; i++) {
        const r = .6 + Math.random() * .4;
        const g = .6 + Math.random() * .4;
        const b = .6 + Math.random() * .4;
        boxes_left.push(addBox(0, 0, 0, r, g, b));
        boxes_right.push(addBox(0, 0, 0, r, g, b));
      }
    }
    if (indexFingerBoxes.left) {
      global.scene().removeNode(indexFingerBoxes.left);
    }
    if (indexFingerBoxes.right) {
      global.scene().removeNode(indexFingerBoxes.right);
    }
    indexFingerBoxes.left = addBox(0, 0, 0, leftBoxColor.r, leftBoxColor.g, leftBoxColor.b);
    indexFingerBoxes.right = addBox(0, 0, 0, rightBoxColor.r, rightBoxColor.g, rightBoxColor.b);
  }
export function initXR() {
    xrButton = new WebXRButton({
        onRequestSession: onRequestSession,
        onEndSession: onEndSession,
    });
    global.setXREntry(xrButton);

    if (navigator.xr) {
        navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
            console.log("immersive-vr supported:[" + supported + "]");
            xrButton.enabled = supported;
            window.vr = supported;
            window.avatars[window.playerid].vr = window.vr;
            global.setIsImmersive(supported);
        }).catch((err) => {
            console.warn("immersive-vr not supported on this platform!");
        });

        // Load multiple audio sources.
        // loadAudioSources(global.scene());

        navigator.xr.requestSession("inline").then(onSessionStarted);
    } else {
        console.warn("navigator.xr unavailable");
    }

    // custom init
    window.EventBus = new EventBus();
    // window.objs = [];
    DefaultSystemEvents.init();
    // websocket
    // window.wsclient = new WSClient();
    // if (window.location.port) {
    //     window.wsclient.connect(window.location.hostname, window.location.port);
    // } else {
    //     window.wsclient.connect("eye.3dvar.com", window.wsport);
    // }
    setAvatarSync();
    initModels();
    keyboardInput.initKeyEvents();
}

function setAvatarSync() {
    setInterval(function () {
        if (window.playerid != null) {
            var msg = corelink_message("avatar", window.playerid);
            corelink.send(metaroomSyncSender, msg);
            // console.log("corelink.send", msg);
            // window.wsclient.send("avatar", window.playerid);
        }
    }, 40);
}

window.testws = function () {
    window.wsclient.send("test");
};

function initGL() {
    if (gl) return;

    gl = createWebGLContext({
        xrCompatible: true,
        webgl2: true,
    });
    document.body.appendChild(gl.canvas);
    window.canvas = gl.canvas;
    function onResize() {
        gl.canvas.width = gl.canvas.clientWidth * window.devicePixelRatio;
        gl.canvas.height = gl.canvas.clientHeight * window.devicePixelRatio;
    }
    window.addEventListener("resize", onResize);
    onResize();

    renderer = new Renderer(gl);
    global.scene().setRenderer(renderer);

    // Loads a generic controller meshes.
    global.scene().inputRenderer.setControllerMesh(
        new Gltf2Node({ url: "./media/gltf/controller/controller.gltf" }),
        "right"
    );
    global.scene().inputRenderer.setControllerMesh(
        new Gltf2Node({ url: "./media/gltf/controller/controller-left.gltf" }),
        "left"
    );

    window.clay = new Clay(gl, gl.canvas);
    window.clay.addEventListenersToCanvas(gl.canvas);
    
}

function onRequestSession() {
    return navigator.xr
        .requestSession("immersive-vr", {
            requiredFeatures: ["local-floor"],
            optionalFeatures: ["hand-tracking"],
        })
        .then((session) => {
            xrButton.setSession(session);
            session.isImmersive = true;
            onSessionStarted(session);
        });
}

async function onSessionStarted(session) {
    session.addEventListener("end", onSessionEnded);

    session.addEventListener('visibilitychange', e => {
        // remove hand controller while blurred
        if(e.session.visibilityState === 'visible-blurred') {
          for (const box of boxes['left']) {
            global.scene().removeNode(box);
          }
          for (const box of boxes['right']) {
            global.scene().removeNode(box);
          }
        }
      });


    //Each input source should define a primary action. A primary action (which will sometimes be shortened to "select action") is a platform-specific action which responds to the user manipulating it by delivering, in order, the events selectstart, select, and selectend. Each of these events is of type XRInputSourceEvent.
    session.addEventListener("selectstart", onSelectStart);
    session.addEventListener("selectend", onSelectEnd);
    session.addEventListener("select", (ev) => {
        let refSpace = ev.frame.session.isImmersive
            ? inputController.referenceSpace
            : inlineViewerHelper.referenceSpace;
        global.scene().handleSelect(ev.inputSource, ev.frame, refSpace);
    });

    initGL();
    initHands();
    // scene.inputRenderer.useProfileControllerMeshes(session);

    let glLayer = new XRWebGLLayer(session, gl);
    session.updateRenderState({ baseLayer: glLayer });

    let refSpaceType = session.isImmersive ? "local-floor" : "viewer";
    session.requestReferenceSpace(refSpaceType).then((refSpace) => {
        if (session.isImmersive) {
            // xrImmersiveRefSpace = refSpace;
            inputController = new InputController(refSpace);
            xrImmersiveRefSpace = inputController.referenceSpace;
        } else {
            inlineViewerHelper = new InlineViewerHelper(gl.canvas, refSpace);
            inlineViewerHelper.setHeight(1.6);
        }

        session.requestAnimationFrame(onXRFrame);
    });
}

function onEndSession(session) {
    session.end();
}

function onSessionEnded(event) {
    if (event.session.isImmersive) {
        xrButton.setSession(null);

        // Stop the audio playback when we exit XR.
        // pauseAudio();
    }
}

function updateInputSources(session, frame, refSpace) {
    
    for (let inputSource of session.inputSources) {
        let targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);
        let offset = 0;

        // We may not get a pose back in cases where the input source has lost
        // tracking or does not know where it is relative to the given frame
        // of reference.
        if (!targetRayPose) {
            continue;
        }

        // If we have a pointer matrix we can also use it to render a cursor
        // for both handheld and gaze-based input sources.

        // Statically render the cursor 2 meters down the ray since we're
        // not calculating any intersections in this sample.
        let targetRay = new Ray(targetRayPose.transform);
        let cursorDistance = 2.0;
        let cursorPos = vec3.fromValues(
            targetRay.origin.x,
            targetRay.origin.y,
            targetRay.origin.z
        );
        vec3.add(cursorPos, cursorPos, [
            targetRay.direction.x * cursorDistance,
            targetRay.direction.y * cursorDistance,
            targetRay.direction.z * cursorDistance,
        ]);
        // vec3.transformMat4(cursorPos, cursorPos, inputPose.targetRay.transformMatrix);

        global.scene().inputRenderer.addCursor(cursorPos);
        if(inputSource.hand) {
            window.handtracking = true;
            for (const box of boxes[inputSource.handedness]) {
                global.scene().removeNode(box);
            }
    
            let pose = frame.getPose(inputSource.targetRaySpace, refSpace);
            if (pose === undefined) {
                console.log("no pose");
            }
    
            if (!frame.fillJointRadii(inputSource.hand.values(), radii)) {
                console.log("no fillJointRadii");
                continue;
            }
            if (!frame.fillPoses(inputSource.hand.values(), refSpace, positions)) {
                console.log("no fillPoses");
                continue;
            }
            const thisAvatar = window.avatars[window.playerid];
            for (const box of boxes[inputSource.handedness]) {
                // global.scene().addNode(box);
                let matrix = positions.slice(offset * 16, (offset + 1) * 16);
                let jointRadius = radii[offset];
                offset++;
                // mat4.getTranslation(box.translation, matrix);
                // mat4.getRotation(box.rotation, matrix);
                // box.scale = [jointRadius, jointRadius, jointRadius];
                updateHandtracking(thisAvatar, {
                    handedness: inputSource.handedness,
                    matrix: matrix,
                    index: offset,
                    scale: jointRadius,
                });
            }
                
            // // Render a special box for each index finger on each hand	
            // const indexFingerBox = indexFingerBoxes[inputSource.handedness];	
            // global.scene().addNode(indexFingerBox);	
            // let joint = inputSource.hand.get('index-finger-tip');	
            // let jointPose = frame.getJointPose(joint, xrImmersiveRefSpace);	
            // if (jointPose) {	
            //     let matrix = jointPose.transform.matrix;
            //     mat4.getTranslation(indexFingerBox.translation, matrix);
            //     mat4.getRotation(indexFingerBox.rotation, matrix);
            //     indexFingerBox.scale = [0.02, 0.02, 0.02];	
            // }
        } else if (inputSource.gripSpace) {
            window.handtracking = false;
            let gripPose = frame.getPose(inputSource.gripSpace, refSpace);
            if (gripPose) {
                // If we have a grip pose use it to render a mesh showing the
                // position of the controller.
                global.scene().inputRenderer.addController(
                    gripPose.transform.matrix,
                    inputSource.handedness
                ); // let controller = this._controllers[handedness]; // so it is updating actually
                // ZH: update location
                // if (window.playerid) {
                    if (inputSource.handedness == "left") {
                        window.avatars[window.playerid].leftController.position =
                            gripPose.transform.position;
                        window.avatars[window.playerid].leftController.orientation =
                            gripPose.transform.orientation;
                        window.avatars[window.playerid].leftController.matrix =
                            gripPose.transform.matrix;
                    } else if (inputSource.handedness == "right") {
                        window.avatars[window.playerid].rightController.position =
                            gripPose.transform.position;
                        window.avatars[window.playerid].rightController.orientation =
                            gripPose.transform.orientation;
                        window.avatars[window.playerid].rightController.matrix =
                            gripPose.transform.matrix;
                    }
                // }
            }
        }
        let headPose = frame.getViewerPose(refSpace);
        // if (window.playerid) {
            window.avatars[window.playerid].headset.position =
                headPose.transform.position;
            window.avatars[window.playerid].headset.orientation =
                headPose.transform.orientation;
            window.avatars[window.playerid].headset.matrix =
                headPose.transform.matrix;

            for (let source of session.inputSources) {
                if (!window.handtracking && source.handedness && source.gamepad) {
                    // if (source.gamepad.buttons[3].pressed) {
                    //     console.log("source.gamepad.buttons[3].pressed", source.gamepad.buttons[3].pressed);
                    // }
                    if (source.handedness == "left")
                        window.avatars[window.playerid].leftController.updateButtons(source.gamepad.buttons);
                    if (source.handedness == "right")
                        window.avatars[window.playerid].rightController.updateButtons(source.gamepad.buttons);
                    // console.log("leftController", window.avatars[window.playerid].leftController);
                    // console.log("rightController", window.avatars[window.playerid].rightController)
                }
            }
        // }
    }
}

function hitTest(inputSource, frame, refSpace) {
    let targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);
    if (!targetRayPose) {
        return;
    }

    let hitResult = global.scene().hitTest(targetRayPose.transform);
    if (hitResult) {
        // for (let source of audioSources) {
        //     if (hitResult.node === source.node) {
        //         // Associate the input source with the audio source object until
        //         // onSelectEnd event is raised with the same input source.
        //         source.draggingInput = inputSource;
        //         source.draggingTransform = mat4.create();
        //         mat4.invert(source.draggingTransform, targetRayPose.transform.matrix);
        //         mat4.multiply(source.draggingTransform, source.draggingTransform, source.node.matrix);
        //         return true;
        //     }
        // }
        for (let id in window.objects) {
            if (hitResult.node === window.objects[id].node) {
                // Associate the input source with the audio source object until
                // onSelectEnd event is raised with the same input source.
                window.objects[id].draggingInput = inputSource;
                window.objects[id].draggingTransform = mat4.create();
                mat4.invert(
                    window.objects[id].draggingTransform,
                    targetRayPose.transform.matrix
                );
                mat4.multiply(
                    window.objects[id].draggingTransform,
                    window.objects[id].draggingTransform,
                    window.objects[id].node.matrix
                );
                updateObject(id);
                return true;
            }
        }
    }

    return false;
}

window.testObjSync = function (id) {
    mat4.translate(
        window.objects[id].node.matrix,
        window.objects[id].node.matrix,
        [0.2, 0.1, 0]
    );
    updateObject(id, window.objects[id].node.matrix);
};

function onSelectStart(ev) {
    let refSpace = ev.frame.session.isImmersive
        ? inputController.referenceSpace
        : inlineViewerHelper.referenceSpace;
    hitTest(ev.inputSource, ev.frame, refSpace);
}

// Remove any references to the input source from the audio sources so
// that the objects are not dragged any further after the user releases
// the trigger.
function onSelectEnd(ev) {
    // for (let source of audioSources) {
    //     if (source.draggingInput === ev.inputSource) {
    //         source.draggingInput = undefined;
    //         source.draggingTransform = undefined;
    //     }
    // }
    for (let id in window.objects) {
        if (window.objects[id].draggingInput === ev.inputSource) {
            // Associate the input source with the audio source object until
            // onSelectEnd event is raised with the same input source.
            window.objects[id].draggingInput = undefined;
            window.objects[id].draggingTransform = undefined;
        }
    }
}

function onXRFrame(t, frame) {
    time = t / 1000;
    let session = frame.session;
    let refSpace = session.isImmersive
        ? inputController.referenceSpace
        : inlineViewerHelper.referenceSpace;
    let pose = frame.getViewerPose(refSpace);


    session.requestAnimationFrame(onXRFrame);

    keyboardInput.updateKeyState();

    global.scene().startFrame();


    updateInputSources(session, frame, refSpace);
    // ZH: send to websocket server for self avatar sync
    // if (window.playerid != null) window.wsclient.send("avatar", window.playerid);
    // corelink
    // if (window.playerid != null) {
    //     var msg = corelink_message("avatar", window.playerid);
    //     corelink.send(metaroomSyncSender, msg);
    //     // console.log("corelink.send", msg);
    //     // window.wsclient.send("avatar", window.playerid);
    // }
    // Update the position of all currently selected audio sources. It's
    // possible to select multiple audio sources and drag them at the same
    // time (one per controller that has the trigger held down).
    // updateAudioSources(frame, refSpace);

    // updateAudioNodes(global.scene());

    updateAvatars();

    updateObjects();

    // ZH: save previous "source.gamepad.buttons" for two controllers,
    // check if changes per frame
    // send to the server if changes
    // if (window.playerid) {
        const thisAvatar = window.avatars[window.playerid];
        for (let source of session.inputSources) {
            if (source.handedness && source.gamepad) {
                updateController(thisAvatar, {
                    handedness: source.handedness,
                    buttons: source.gamepad.buttons,
                    axes: source.gamepad.axes
                });
            } 
        }
    // }

    if (refSpace == inlineViewerHelper.referenceSpace) {
        inlineViewerHelper.update();
    }

    global.scene().drawXRFrame(frame, pose, time);

    // if (pose) {
    //     resonance.setListenerFromMatrix({ elements: pose.transform.matrix });
    // }

    global.scene().endFrame();
}

function updateAvatars() {
    // update transformation of each avatar audio source
    // for (let peerUuid in window.peerConnections) {
    //     window.updateAvatarAudio(peerUuid);
    // }

    // update avatar's model's matrix
    for (let id in window.avatars) {
        if (id == window.playerid) continue;
        let avatar = window.avatars[id];
        if (
            avatar.headset.position.x ||
            avatar.headset.position.y ||
            avatar.headset.position.z
        ) {
            // not in the default pos
            avatar.headset.model.matrix = avatar.headset.matrix;
            avatar.leftController.model.matrix = avatar.leftController.matrix;
            avatar.rightController.model.matrix = avatar.rightController.matrix;
        }
    }
}

function updateObjects() {
    // update objects' attributes
    for (let id in window.objects) {
        let type = window.objects[id]["type"];
        let matrix = window.objects[id]["matrix"];
        // create the model if model is null
        if (!window.objects[id].node && type in window.models) {
            // create the model, this is the sample by gltf model
            // we may need other model style like CG.js later
            window.objects[id].node = new Gltf2Node({
                url: window.models[type]._url,
            });
            window.objects[id].node.visible = true;
            window.objects[id].node.selectable = true;
            global.scene().addNode(window.objects[id].node);
        }
        window.objects[id].node.matrix = matrix;
    }
}

// Start the XR application.
// initXR();
