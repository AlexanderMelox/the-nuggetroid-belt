let container, controls, camera, scene, renderer, nuggets;
let numOfNugs = 200;

init();
animate();

function init() {
  // create container div
  container = document.createElement('div');
  // append container div to end of body
  document.body.appendChild(container);

  // create camera
  let fov = 50;
  let aspectRatio = window.innerWidth / window.innerHeight;
  let near = 0.1;
  let far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
  camera.position.set(-500, 0, 100);

  // create scene
  scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 0.3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-2, 2, 4);
    scene.add(light);
  }

  // load model
  const loader = new THREE.GLTFLoader();
  nuggets = [];

  let mesh;
  for (let i = 0; i <= numOfNugs; i++) {
    loader.load('models/nugget.gltf', gltf => {
      mesh = gltf.scene.children[0];
      mesh.material = new THREE.MeshPhongMaterial({ color: 0xbc9229 });
      mesh.position.z = getRandomPosition();
      mesh.position.x = getRandomPosition();
      mesh.position.y = getRandomPosition();
      mesh.rotation.z = getRandomPosition();
      mesh.position.x = getRandomPosition();
      mesh.rotation.y = getRandomPosition();
      console.log('mesh', mesh);
      scene.add(mesh);

      //checking size
      const box = new THREE.Box3().setFromObject(mesh);
      boxSize = box.getSize(new THREE.Vector3()).length();
      boxCenter = box.getCenter(new THREE.Vector3());
      // console.log(boxSize);
      // console.log(boxCenter);
      // set the camera to frame the box
      // frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
      controls = new THREE.OrbitControls(camera, scene);
      // update the Trackball controls to handle the new size
      controls.maxDistance = boxSize * 10;
      controls.target.copy(boxCenter);
      controls.update();
      nuggets.push(mesh);
    });
  }
  console.log('nuggets :', nuggets);

  // add light
  let light = new THREE.AmbientLight(0xffbd33, 0.6);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // controls = new THREE.OrbitControls(camera, renderer.domElement);
  // controls.target.set(0, -0.2, -0.2);
  // controls.update();

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
  time *= 0.001; // conver time to seconds
  nuggets.forEach(nugget => {
    nugget.rotation.y = time;
    // nugget.rotation.x = time;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  // controls.update();
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.Math.degToRad(camera.fov * 0.5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

  // compute a unit vector that points in the direction the camera is now
  // from the center of the box
  const direction = new THREE.Vector3().subVectors(camera.position, boxCenter).normalize();

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  camera.updateProjectionMatrix();

  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function getRandomPosition() {
  return Math.max(1, Math.floor(Math.random() * 300));
}
