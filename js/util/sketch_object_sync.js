import { corelink_message } from "./corelink_sender.js"
import { metaroomSyncSender } from '../corelink_handler.js'

export function setSketchObjectSync() {
    setInterval(function () {
        if (window.playerid != null) {
            // to Ken: replace dataInfo with real info like window.ball in demoDesktopHand.js
            var dataInfo = { "k": "v" }
            var msg = corelink_message("sketchobject", dataInfo);
            corelink.send(metaroomSyncSender, msg);
            // console.log("corelink.send", msg);
        }
    }, 100);
}

export function setEventSketchObjectHandler() {
    window.EventBus.subscribe("sketchobject", (json) => {
        console.log("[sketchobject]");
        if (json["uid"] == window.playerid) {
            console.log("self msg on sketchobject");
            //   return;
        }
        // to Ken: handle incoming object
        var newSketchObject = json["state"];
        console.log("incoming newSketchObject", newSketchObject);
    });
}