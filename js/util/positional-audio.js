"use strict"

import { UrlTexture } from '../render/core/texture.js';
import { ButtonNode } from '../render/nodes/button.js';
import { Gltf2Node } from '../render/nodes/gltf2.js';
import { mat4, vec3 } from '../render/math/gl-matrix.js';
import { initObject, updateObject } from './object-sync.js';

const ANALYSER_FFT_SIZE = 1024;
const DEFAULT_HEIGHT = 1.5;

// Audio scene globals
let audioContext = new AudioContext();
let loaded = false;
let count = 0;
export let resonance = new ResonanceAudio(audioContext);
resonance.output.connect(audioContext.destination);

audioContext.suspend();

export function createAudioSource(options) {
    // Create a Resonance source and set its position in space.
    let source = resonance.createSource();
    let pos = options.position;
    source.setPosition(pos[0], pos[1], pos[2]);

    // Connect an analyser. This is only for visualization of the audio, and
    // in most cases you won't want it.
    let analyser = audioContext.createAnalyser();
    analyser.fftSize = ANALYSER_FFT_SIZE;
    analyser.lastRMSdB = 0;

    return fetch(options.url)
        .then((response) => response.arrayBuffer())
        .then((buffer) => audioContext.decodeAudioData(buffer))
        .then((decodedBuffer) => {
            let bufferSource = createBufferSource(
                source, decodedBuffer, analyser);

            return {
                buffer: decodedBuffer,
                bufferSource: bufferSource,
                source: source,
                analyser: analyser,
                position: pos,
                rotateY: options.rotateY,
                node: null
            };
        });
}

function createBufferSource(source, buffer, analyser) {
    // Create a buffer source. This will need to be recreated every time
    // we wish to start the audio, see
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
    let bufferSource = audioContext.createBufferSource();
    bufferSource.loop = true;
    bufferSource.connect(source.input);

    bufferSource.connect(analyser);

    bufferSource.buffer = buffer;

    return bufferSource;
}

/**
 * Returns a floating point value that represents the loudness of the audio
 * stream, appropriate for scaling an object with.
 * @return {Number} loudness scalar.
 */
let fftBuffer = new Float32Array(ANALYSER_FFT_SIZE);
function getLoudnessScale(analyser) {
    analyser.getFloatTimeDomainData(fftBuffer);
    let sum = 0;
    for (let i = 0; i < fftBuffer.length; ++i)
        sum += fftBuffer[i] * fftBuffer[i];

    // Calculate RMS and convert it to DB for perceptual loudness.
    let rms = Math.sqrt(sum / fftBuffer.length);
    let db = 30 + 10 / Math.LN10 * Math.log(rms <= 0 ? 0.0001 : rms);

    // Moving average with the alpha of 0.525. Experimentally determined.
    analyser.lastRMSdB += 0.525 * ((db < 0 ? 0 : db) - analyser.lastRMSdB);

    // Scaling by 1/30 is also experimentally determined. Max is to present
    // objects from disappearing entirely.
    return Math.max(0.3, analyser.lastRMSdB / 30.0);
}

export let audioSources = [];

export function playAudio() {
    if (!loaded || audioContext.state == 'running') {
        for (let source of audioSources) {
            source.position = [Math.sin(count), DEFAULT_HEIGHT, 0]
            source.source.setPosition(Math.sin(count), DEFAULT_HEIGHT, 0)
            count += 0.05;
        }
        return;
    }

    audioContext.resume();

    for (let source of audioSources) {
        source.bufferSource.start(0);
    }
}

export function pauseAudio() {
    if (audioContext.state == 'suspended')
        return;

    for (let source of audioSources) {
        source.bufferSource.stop(0);
        source.bufferSource = createBufferSource(
            source.source, source.buffer, source.analyser);
    }

    audioContext.suspend();
}

window.addEventListener('blur', () => {
    // As a general rule you should mute any sounds your page is playing
    // whenever the page loses focus.
    pauseAudio();
});

export function loadAudioSources(scene) {
    Promise.all([
        createAudioSource({
            url: 'media/sound/guitar.ogg',
            position: [-1, DEFAULT_HEIGHT, -1],
            rotateY: 0
        }),
        createAudioSource({
            url: 'media/sound/drums.ogg',
            position: [-1, DEFAULT_HEIGHT, 0],
            rotateY: Math.PI * 0.5
        }),
        createAudioSource({
            url: 'media/sound/perc.ogg',
            position: [-1, DEFAULT_HEIGHT, 0],
            rotateY: Math.PI * -0.5
        }),
    ]).then((sources) => {
        audioSources = sources;
        loaded = true;
    });
}