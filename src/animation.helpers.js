import { Vector2 } from "./Vector2";
import lockSvgString from "./lockSvgString";

const maxEyeTravelX = 275;
const maxEyeTravelY = 100;
const PI = Math.PI;
const numEyesX = 11;
const numEyesY = 5;

const map = (value, min1, max1, min2, max2) => {
    return ((value - min1) * (max2 - min2)) / (max1 - min1) + min2;
};

const clamp = (value, min = 0, max = 1) => {
    return value <= min ? min : value >= max ? max : value;
};

export const execThrottled = fn => {
    let didRequest = false;
    return param => {
        if (!didRequest) {
            requestAnimationFrame(() => {
                fn(param);
                didRequest = false;
            });
            didRequest = true;
        }
    };
};

export const renderEyes = (baseObject, grid, eyes, eyeCenters) => {
    grid.style.setProperty("--num-columns", numEyesX);
    grid.style.setProperty("--num-rows", numEyesY);
    grid.innerHTML = "";
    for (let j = 0; j < numEyesY; j++) {
        for (let k = 0; k < numEyesX; k += 1) {
            const i = numEyesY * k + j;

            /**
             * k = horizontal coordinate (x-axis)
             * j = vertical coordinate (y-axis)
             * (5 - k) ** 2 : to ganerate the curve density taking 5th colomn as center
             * j - 2 : to change the direction of curve vertically, it will bend downward after 2nd row
             * 1.33 : Rate in which curve will gain the height corresponding to each dot
             */
            const topOffset = (j - 2) * (5 - k) ** 2 * 1.33;
            renderEye(baseObject, grid, eyes, eyeCenters, i, topOffset);
        }
    }
};

const renderEye = (baseObject, grid, eyes, eyeCenters, i, topOffset) => {
    const eye = baseObject.cloneNode(true);
    eye.id = `eye-${i}`;
    eye.setAttribute("class", "eye");
    grid.appendChild(eye);
    eyes.push(eye);
    eye.style.setProperty("--top", topOffset);

    const eyeRect = eye.getBoundingClientRect();
    const eyeCenter = new Vector2(
        eyeRect.left + eye.clientWidth * 0.5,
        eyeRect.top + eye.clientHeight * 0.5
    );
    eyeCenters.push(eyeCenter);
};

export const updateEye = (eye, eyeCenter, mousePos, maxDist, isInitial) => {
    const vecToMouse = new Vector2().subVectors(mousePos, eyeCenter);
    const clampedMouseX = clamp(
        vecToMouse.x,
        maxEyeTravelX * -1,
        maxEyeTravelX
    );
    const clampedMouseY = clamp(
        vecToMouse.y,
        maxEyeTravelY * -1,
        maxEyeTravelY
    );
    const pupilX = map(clampedMouseX, 0, maxEyeTravelX, 0, maxEyeTravelX);
    const pupilY = map(clampedMouseY, 0, maxEyeTravelY, 0, maxEyeTravelY);
    const dist = mousePos.distanceTo(eyeCenter);
    const scale = map(dist, 0, maxDist / 2.5, 0.5, 2);
    const distX = Math.abs(mousePos.x - eyeCenter.x);
    const distY = Math.abs(mousePos.y - eyeCenter.y);
    const path = eye.getElementsByClassName("clipPath")[0];
    const atanVal = Math.atan(pupilX / pupilY);
    let angle = distY < 60 ? 0 : (atanVal * (180 / PI)) / 4;

    if (distX > 350 || distY > 350 || isInitial) {
        eye.style.setProperty("--color-pupil", "#fff");
        eye.style.setProperty("--color-whites", "#6c4aff");
        eye.style.setProperty("--color-lid", "#6c4aff");
        path?.setAttribute("fill", "transparent");
        path?.setAttribute("clip-path", "");
        eye.style.setProperty("--scale-x", 1);
        eye.style.setProperty("--scale-y", 1);
        eye.style.setProperty("--angle", 0);
    } else {
        eye.style.setProperty("--color-pupil", "#000");
        eye.style.setProperty("--color-whites", "#fff");
        path?.setAttribute("fill", "#fff");
        path?.setAttribute("clip-path", "url(#lids)");
        eye.style.setProperty("--pupil-x", pupilX);
        eye.style.setProperty("--pupil-y", pupilY);
        eye.style.setProperty("--scale-y", scale);
        eye.style.setProperty("--scale-x", scale);
        eye.style.setProperty("--angle", `${angle}deg`);
    }
};

export const moveLockIcon = (event, parentRef, lockRef, gridRef) => {
    const parentRect = parentRef.current.getBoundingClientRect();
    const lockRect = lockRef.current.getBoundingClientRect();
    const gridRect = gridRef.current.getBoundingClientRect();
    const gridX = gridRect.x;
    const gridY = gridRect.y;
    if (
        gridX - 50 > event.clientX ||
        gridY - 50 > event.clientY ||
        gridX + 50 + gridRect.width < event.clientX ||
        gridY + 50 + gridRect.height < event.clientY
    ) {
        lockRef.current.style.display = "none";
        lockRef.current.setAttribute("data-ts", "");
        lockRef.current.src = "";
        parentRef.current.style.cursor = "auto";
    } else {
        lockRef.current.style.display = "block";
        if (!lockRef.current.getAttribute("data-ts")) {
            const timeStamp = new Date().getTime();
            lockRef.current.src = `${lockSvgString.replace(
                "%7BTIME_STAMP%7D",
                timeStamp
            )}`;
            lockRef.current.setAttribute("data-ts", timeStamp);
        }
        parentRef.current.style.cursor = "none";
    }
    const y = event.clientY - parentRect.top - lockRect.height / 2;
    const x = event.clientX - parentRect.left - lockRect.width / 2;

    lockRef.current.style.top = `${y}px`;
    lockRef.current.style.left = `${x}px`;
};
