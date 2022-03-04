# FutureClassroom

Software for 2022 VR class

# How to setup environment

install Node.js and npm if you haven't

`npm install`

# How to run locally

install python3 if you haven't

`python run.py`

then go to http://localhost:8000

# How to run in VR

1. Run the program locally on your compurer
2. Open Google Chrome browser on your VR headset
3. Go to chrome://flags/
4. Search: ***"Insecure origins treated as secure"*** and enable the flag
5. Add http://[your-computer's-ip-address]:8000 to the text box. For example: http://10.19.127.1:8000
7. Relunch the browser on your VR headset and go to http://[your-computer's-ip-address]:8000 

# How to debug in VR

1. On your Oculus app, go to *Devices*, select your headset from the device list and wait for it to connect.Then select *Developer Mode* and turn on *Developer Mode*.
2. Connect your quest with your computer using your Oculus Quest cable.
3. Go to chrome://inspect#devices on your computer
4. Go to your VR headset and accept *Allow USB Debugging* when prompted on the headset
5. On the chrome://inspect#devices on your computer, you should be able to see your device under the *Remote Target* and its active programs. You can then inspect the *2022 VR Class* window on your computer.

# How to create your own demo

1. Go to the [scenes folder](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/) and create a .js file based on the template of [demoCube.js](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/demoCube.js)
2. Change the name and the content of the demo to whatever you like!
3. Go to [scenes.js](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/scenes.js), add the name of your demo and its path to the returned value of [```scenes```](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/scenes.js#L12)
4. Note that the [```enableSceneReloading```](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/scenes.js#L11) is set to true so that you can hot-reload the changes in your demo. 

# How to enable your hand tracking

1. Enable the experimental feature in the browser (Oculus Browser 11)
2. Visit chrome://flags/
3. Enable WebXR experiences with joints tracking (#webxr-hands)
4. Enable WebXR Layers depth sorting (#webxr-depth-sorting)
5. Enable WebXR Layers (#webxr-layers)
6. Enable phase sync support (#webxr-phase-sync)
7. Enable "Auto Enable Hands or Controllers" (Quest Settings (Gear Icon) -> Device -> Hands and Controllers)
8. Enter the VR experience
