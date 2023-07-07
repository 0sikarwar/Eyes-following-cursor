import "./index.css";
import React, { useRef, useEffect } from "react";
import { Vector2 } from "./Vector2";
import { svgString } from "./eyeSvg";
import {
  execThrottled,
  moveLockIcon,
  renderEyes,
  updateEye
} from "./animation.helpers";

let eyes, eyeCenters;
const center = new Vector2();
const mousePos = new Vector2();
let maxDist;

const EyeAnimation = () => {
  const parentRef = useRef();
  const gridRef = useRef();
  const lockRef = useRef();

  const init = () => {
    window.addEventListener("resize", execThrottled(handleResize));
    parentRef.current.addEventListener(
      "mousemove",
      execThrottled(handleMouseMove)
    );
    handleResize();
    parentRef.current.addEventListener("mouseleave", reset);
  };

  const handleMouseMove = (event, isInitial) => {
    mousePos.set(event.clientX, event.clientY);
    const sampleEye = eyes[0];
    const eyeWidth = sampleEye.clientWidth / 2;
    const eyeHeight = sampleEye.clientHeight / 2;
    moveLockIcon(event, parentRef, lockRef, gridRef);
    eyes.forEach((eye, i) => {
      const eyeRect = eye.getBoundingClientRect();
      const temp = [eyeWidth + eyeRect.left, eyeHeight + eyeRect.top];
      if (
        Math.abs(temp[0] - eyeCenters[i].x) < 10 &&
        Math.abs(temp[1] < eyeCenters[i].y) < 10
      )
        eyeCenters[i].set(eyeWidth + eyeRect.left, eyeHeight + eyeRect.top);
      updateEye(eye, eyeCenters[i], mousePos, maxDist, isInitial);
    });
  };
  useEffect(() => {
    generateArrowGrid();
    init();
  }, []);

  const handleResize = () => {
    generateArrowGrid();
  };
  const reset = () => {
    handleMouseMove({ clientX: center.x, clientY: center.y }, true);
    // lockRef.current.style.display = "none";
  };

  const generateArrowGrid = () => {
    eyes = [];
    eyeCenters = [];
    const htmlObject = document.createElement("div");
    htmlObject.innerHTML = svgString;
    const baseObject = htmlObject.getElementsByClassName("eye")[0];
    const grid = gridRef.current;
    renderEyes(baseObject, grid, eyes, eyeCenters);
    const innerWidth = parentRef.current.offsetWidth;
    const innerHeight = parentRef.current.offsetHeight;
    const center = new Vector2(innerWidth * 0.5, innerHeight * 0.5);
    maxDist = center.length() * 2;
  };

  return (
    <div className="eyes-container" ref={parentRef}>
      <div
        id="eyes-container-grid"
        ref={gridRef}
        className="eyes-container-grid"
      ></div>
      <img ref={lockRef} className="eyes-container-lock" />
    </div>
  );
};

export default EyeAnimation;
