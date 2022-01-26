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
5. Add http://[your-computer's-ip-address]:8000 to the text box
   for example: http://10.19.127.1:8000
6. Relunch the brower on your VR headset and go to http://[your-computer's-ip-address]:8000 

# How to create your own demo

1. Go to the [scenes folder](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/) and create a .js file based on the template of [demoCube.js](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/demoCube.js)
2. Change the name and the content of the demo to whatever you like!
3. Go to [scenes.js](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/scenes.js) and import your demo there.
4. Go to the buttom of that file and add your demo's name to the [```window.demoNames```](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/scenes.js#L51). This will generate a button and a boolean called **demo*YourDemoName*State** for you. Every time you click the button, the boolean will reverse its value. If you have more than one demos, seperate their names with ```,```
5. Using that boolean, you can load and stop your demo by clicking button similar to [how we display the demoCube](https://github.com/futurerealitylab/FutureClassroom/tree/master/js/scenes/scenes.js#L16)
