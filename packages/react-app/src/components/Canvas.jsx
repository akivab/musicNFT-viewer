// Adapted from https://therewasaguy.github.io/p5-music-viz/demos/01d_beat_detect_amplitude/sketch.js

import React, {useEffect, useRef, useState} from "react";
import Sketch from "react-p5";
import 'p5/lib/addons/p5.sound';

let Canvas = (props) => {
    const soundFile = useRef(null);
    const amplitude = useRef(null);

    const backgroundColor = useRef(null);

    // rectangle parameters
    const rectRotate = useRef(true);
    const rectMin = 15;
    const rectOffset = 20;
    const numRects = 10;

    // :: Beat Detect Variables
    // how many draw loop frames before the beatCutoff starts to decay
    // so that another beat can be triggered.
    // frameRate() is usually around 60 frames per second,
    // so 20 fps = 3 beats per second, meaning if the song is over 180 BPM,
    // we wont respond to every beat.
    const beatHoldFrames = 30;

    // what amplitude level can trigger a beat?
    const beatThreshold = 0.11;

    // When we have a beat, beatCutoff will be reset to 1.1*beatThreshold, and then decay
    // Level must be greater than beatThreshold and beatCutoff before the next beat can trigger.
    const beatCutoff = useRef(0);
    const beatDecayRate = useRef(0.98); // how fast does beat cutoff decay?
    const framesSinceLastBeat = useRef(0); // once this equals beatHoldFrames, beatCutoff starts to decay.

    const touchEnded = (evt) => {
        if (!soundFile.current || soundFile.current._playing) {
            if (soundFile.current && soundFile.current._playing) {
                soundFile.current.pause();
            }
            return;
        }
        soundFile.current._looping = true;
        soundFile.current.play();
    };

    const preload = (_p5) => {
        console.log("Starting preload");

        const url = props.url;
        if (!url || !url.length) {
            return;
        }
        try {
            soundFile.current && soundFile.current.stop();
            soundFile.current = _p5.loadSound(url, () => {
                amplitude.current = new _p5.constructor.Amplitude();
                amplitude.current.setInput(soundFile.current);
                amplitude.current.smooth(0.9);
                document.getElementById('vidId1').play();
            });
        } catch (err) {
            console.log(err);
        }
        soundFile.current._looping = true;
        console.log("Ending preload");
    };
    const setup = async (_p5, canvasParentRef) => {
        console.log("Starting setup");
        // use parent to render the canvas in this ref
        // (without that p5 will render the canvas outside of your component)
        let canvas = _p5.createCanvas(256, 256).parent(canvasParentRef);
        canvas.elt.addEventListener("mousedown", touchEnded);
        canvas.style( 'margin', 'auto' );
        canvas.style( 'display', 'block' );
        canvas.style( 'padding', '30px');
        _p5.noStroke();
        _p5.rectMode(_p5.CENTER);
        backgroundColor.current = _p5.color(
            _p5.random(0,255),
            _p5.random(0,255),
            _p5.random(0,255),
            80
        );
        if (soundFile.current) {
            soundFile.current.play();
        }

        console.log("Ending setup");
    };

    const detectBeat = (_p5, level) => {
        if (level  > beatCutoff.current && level > beatThreshold){
            onBeat(_p5);
            beatCutoff.current = level *1.2;
            framesSinceLastBeat.current = 0;
        } else {
            if (framesSinceLastBeat.current <= beatHoldFrames) {
                framesSinceLastBeat.current++;
            } else {
                beatCutoff.current *= beatDecayRate.current;
                beatCutoff.current = Math.max(beatCutoff.current, beatThreshold);
            }
        }
    }

    const onBeat = (_p5) => {
        if (!soundFile.current || !soundFile.current._playing) {
            return;
        }
        backgroundColor.current = _p5.color(
            _p5.random(0,255),
            _p5.random(0,255),
            _p5.random(0,255),
            80
        );
        rectRotate.current = !rectRotate.current;
    }

    const draw = (_p5) => {
        _p5.clear();
        if (backgroundColor.current) {
            _p5.background(backgroundColor.current);
        }

        if (!amplitude.current) {
            return;
        }
        const level = amplitude.current.getLevel();
        detectBeat(_p5, level);

        // distort the rectangle based based on the amp
        const distortDiam = _p5.map(level, 0, 1, 0, 1200);
        let rotation;

        // distortion direction shifts each beat
        if (rectRotate.current) {
            rotation = _p5.PI/ 2;
        } else {
            rotation = _p5.PI/ 3;
        }

        // rotate the drawing coordinates to rectCenter position
        const rectCenter = _p5.createVector(_p5.width/3, _p5.height/2);

        _p5.push();

        // draw the rectangles
        for (let i = 0; i < numRects; i++) {
            const x = rectCenter.x + rectOffset * i;
            const y = rectCenter.y + distortDiam / 2;
            // rotate around the center of this rectangle
            _p5.translate(x, y);
            _p5.rotate(rotation);
            _p5.rect(0, 0, rectMin, rectMin + distortDiam);
        }
        _p5.pop();
    };

    console.log("Rendering a new Sketch");
    const video = (<video id="vidId1" onLoadStart={() => {
        document.getElementById('vidId1').volume = 0.0;
    }} style={{width: '256px', height: '256px', 'zIndex': 1}} key={"vid-" + props.url} width="320" height="320" autoPlay={false}>
        <source src={props.url} type="video/mp4" />
        Your browser does not support the video tag.
    </video>);
    console.log(video);

    return <div style={{display: 'flex', 'alignItems': 'center', 'justifyContent': "center", width: "300px", height: "300px", margin: 'auto'}}>
        {video}
        <Sketch style={{position: 'absolute', 'zIndex': 2 /* <-- to remove */ }} key={props.url} preload={preload} setup={setup} draw={draw}/>
    </div>;
};

export default Canvas;
