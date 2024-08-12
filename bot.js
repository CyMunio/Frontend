(function() {
    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(800, 800);
    document.getElementById('bot').appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // White light with half intensity
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Increased intensity
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Load the model
    const loader = new THREE.GLTFLoader();
    let model;
    loader.load(
        'Assets/robot_playground.glb',
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
                    function animateModel() {
                        requestAnimationFrame(animateModel);
                        const currentTime = Date.now();
                        const deltaTime = (currentTime - prevTime) * 0.001; // Convert milliseconds to seconds
                        mixer.update(deltaTime); // Pass the time delta to update animations properly
                        prevTime = currentTime;
                        renderer.render(scene, camera);
                    }
                    animateModel();
                }
            }
        },
        undefined,
        function(error) {
            console.error(error);
        }
    );

    // Position the camera
    camera.position.set(2, 4, 2); // Position the camera at an angle from the top
    camera.lookAt(1, 1, 1); // Make the camera look at the center of the scene

    // Update camera and renderer size when the window is resized
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
})();
