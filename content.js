import * as THREE from "./node_modules/three/build/three.module.js";
import { Vector2, Vector3, Euler } from "./node_modules/three/build/three.module.js";
import * as materials from "./assets/materials/default.js";
import * as Constants from "./constants.js";

// --- Setup ---
const canvas = document.getElementById("game_canvas");
let width = window.innerWidth;
let height = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(width, height);
document.body.style.cursor = 'none'; // Hide cursor

const camera = new THREE.PerspectiveCamera(88.8, width / height, 0.01, 1000);
camera.position.z = 1;

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const material = materials.default_material;
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const handleKeyPress = (event) => {
    switch (event.code) {
        default: {
            console.log("Key pressed: " + event.code);
            break;
        };
        case "KeyR": {
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 1;
            camera.setRotationFromAxisAngle(new Vector3(1, 1, 1), 0);
            break;
        };
        case "KeyW": {
            setInterval(() => {
                input.forward = true
            }, 500);
            input.forward = false
            break;
        }
    }
};

document.addEventListener("keypress", handleKeyPress);

// Mouse tracking
let mouseDelta = new Vector2();
let mousePosition = new Vector2();

const centerMouse = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    mousePosition.set(centerX, centerY);

    // Use requestAnimationFrame for smoother updates
    window.requestAnimationFrame(() => {
         if (document.pointerLockElement) {
           document.exitPointerLock();
        } 

        canvas.requestPointerLock();
    });
};


const handleMouseMove = (event) => {
    mouseDelta.set(event.movementX, event.movementY);
    mousePosition.set(mousePosition.x + event.movementX, mousePosition.y + event.movementY)
};


canvas.addEventListener('click', centerMouse)
document.addEventListener("mousemove", handleMouseMove);



// --- Camera Controller ---
class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.velocity = new Vector3();
        this.acceleration = 0;
        this.maxSpeed = 1;
        this.moveSpeed = Constants.cameraSpeed * Constants.speedMod;
        this.friction = 0.7;
        this.mouseSensitivity = 0.001;
        this.rotationSpeed = 0.002;
        this.pitch = 0;
        this.yaw = 0;
        this.camera.rotation.order = "YXZ"; // Important for rotation order
    }

    // Movement calculations
    calculateMovement(deltaTime) {
        const moveDelta = this.moveSpeed * deltaTime;
        const forward = new Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        const up = new Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);

        if (input.forward) {
            this.acceleration = Math.min(this.acceleration + moveDelta / 200, this.maxSpeed);
        } else if (input.backward) {
            this.acceleration = Math.max(this.acceleration - moveDelta / 200, -this.maxSpeed);
        }
        
        this.acceleration = this.acceleration * this.friction;
        
        if (input.forward || input.backward) {
            this.velocity.addScaledVector(forward, this.acceleration * moveDelta * 10);
        }
        
        if (input.left) {
            this.velocity.addScaledVector(right, -moveDelta);
        }
        if (input.right) {
            this.velocity.addScaledVector(right, moveDelta);
        }
        if (input.up) {
            this.velocity.addScaledVector(up, moveDelta);
        }
        if (input.down) {
            this.velocity.addScaledVector(up, -moveDelta);
        }
    }

    applyMovement() {
        this.camera.position.add(this.velocity);
        this.velocity.multiplyScalar(0.7);
    }

    // Rotation calculations
    calculateRotation() {
        this.yaw -= mouseDelta.x * this.mouseSensitivity;
        this.pitch += mouseDelta.y * this.mouseSensitivity;

        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch)); // Clamp pitch
    }

    applyRotation(){
        this.camera.rotation.set(this.pitch, this.yaw, 0);
        mouseDelta.set(0, 0); // Reset mouse delta
    }

    update(deltaTime) {
        this.calculateMovement(deltaTime);
        this.applyMovement();
        this.calculateRotation();
        this.applyRotation();
    }
}
const cameraController = new CameraController(camera);


// --- Game Loop ---
let startTime = new Date().getTime();
let endTime;
let deltaTime = 0;

const updateDeltaTime = () => {
    endTime = new Date().getTime();
    deltaTime = (endTime - startTime) / 1000;
    startTime = new Date().getTime();
}


const gameLoop = () => {
    updateDeltaTime()

    cameraController.update(deltaTime);

    mesh.rotateX(Constants.speedMod * 3.141 * deltaTime);
    mesh.rotateY(Constants.speedMod * 3.141 * deltaTime);
    mesh.rotateZ(Constants.speedMod * 3.141 * deltaTime);

    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
};

// --- Resize Handler ---
const handleResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    centerMouse() // Center mouse after resize
};

window.addEventListener("resize", handleResize);
// Start the game
gameLoop();

//Cleanup
renderer.dispose();
geometry.dispose();
material.dispose();