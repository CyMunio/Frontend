// Setup Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 1, 100);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(800, 800);
document.getElementById('main').appendChild(renderer.domElement);


// Add lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Load the model
const loader = new THREE.GLTFLoader();
let model;
loader.load(
    'Assets/earth_hologram (1).glb',
    function(gltf) {
        model = gltf.scene;
        scene.add(model);
        if (model) {
            
            // Access animation clips
            const animations = gltf.animations;
            if (animations && animations.length) {
                // Play the first animation clip
                const mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(animations[0]);
                action.play();
                // Update animations in the animation loop
                let prevTime = Date.now();
                function animate() {
                    requestAnimationFrame(animate);
                    const currentTime = Date.now();
                    const deltaTime = (currentTime - prevTime) * 0.001; // Convert milliseconds to seconds
                    mixer.update(deltaTime); // Pass the time delta to update animations properly
                    prevTime = currentTime;
                    renderer.render(scene, camera);
                }
                animate();
            }
        }
    },
    undefined,
    function(error) {
        console.error(error);
    }
);

// Position the camera
camera.position.z = 3.5;

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

// Update camera and renderer size when the window is resized
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

