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
5. Add http://the-ip-address-running-the-futureClassroom-program:8000 to the text box
6. Relunch the brower on your VR headset and go to http://the-ip-address-running-the-futureClassroom-program:8000 

# How to create your own demo

1. Go to the [clayModels folder](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/render/core/clayModels/) and create a .js file based on the template of [demoCube.js](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/render/core/clayModels/demoCube.js)
2. Change the name and the content of the demo to whatever you like!
3. Go to [clayScene.js](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/render/core/clayModels/clayScene.js) and import your demo there.
4. Go to the buttom of that file and add your demo's name to the [```window.demoNames```](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/render/core/clayModels/clayScene.js#L51). This will generate a button and a boolean called **demo*YourDemoName*State** for you. Every time you click the button, the boolean will reverse its value. If you have more than one demos, seperate their names with ```,```
5. Using that boolean, you can load and stop your demo by clicking button similar to [how we display the demoCube](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/render/core/clayModels/clayScene.js#L16)
