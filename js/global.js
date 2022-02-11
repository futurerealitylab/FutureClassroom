import { Scene } from "./render/core/scene.js";

let scene_ = new Scene();

export function scene()
{
	return scene_;
}

export function setScene(s)
{
	scene_ = s;
}

let sceneNames_ = "";

export function demoNames()
{
	return sceneNames_;
}

export function setDemoNames(names)
{
	sceneNames_ = names;
}

let xrEntryUI_ = null;
export function setXREntry(UIType)
{
	xrEntryUI_ = UIType;
}
export function xrEntryUI()
{
	return xrEntryUI_;
}