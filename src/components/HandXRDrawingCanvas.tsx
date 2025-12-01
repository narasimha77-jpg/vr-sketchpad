import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { useHandTracking } from '@/hooks/useHandTracking';
import DrawingToolbar from './DrawingToolbar';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const HandXRDrawingCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const drawGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const floorRef = useRef<THREE.Mesh | null>(null);
  const lastPositionRef = useRef<THREE.Vector3 | null>(null);
  const cursorSphereRef = useRef<THREE.Mesh | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  
  const handData = useHandTracking(drawingEnabled);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1e);
    scene.fog = new THREE.Fog(0x0a0f1e, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Check VR support
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRSupported(supported);
      });
    }

    // VR Button
    const vrButton = VRButton.createButton(renderer);
    vrButton.style.display = 'none'; // Hide default, we use custom button
    document.body.appendChild(vrButton);

    // Lighting
    const hemisphereLight = new THREE.HemisphereLight(0x00ffff, 0xff00ff, 0.6);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x0088ff, 0.3);
    scene.add(ambientLight);

    // Floor for raycasting
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    floorRef.current = floor;

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x00ffff);
    (gridHelper.material as THREE.Material).opacity = 0.2;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // Draw group
    const drawGroup = new THREE.Group();
    scene.add(drawGroup);
    drawGroupRef.current = drawGroup;

    // Cursor sphere to show hand position
    const cursorGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const cursorMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });
    const cursorSphere = new THREE.Mesh(cursorGeometry, cursorMaterial);
    cursorSphere.visible = false;
    scene.add(cursorSphere);
    cursorSphereRef.current = cursorSphere;

    // Animation loop
    const animate = () => {
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
      document.body.removeChild(vrButton);
    };
  }, []);

  // Handle hand tracking and drawing
  useEffect(() => {
    if (!handData.indexFingerTip || !isDrawing || !cameraRef.current || !floorRef.current) {
      if (cursorSphereRef.current) {
        cursorSphereRef.current.visible = false;
      }
      lastPositionRef.current = null;
      return;
    }

    const { x, y } = handData.indexFingerTip;
    
    // Convert normalized coordinates (0-1) to NDC (-1 to 1)
    const ndcX = x * 2 - 1;
    const ndcY = -(y * 2 - 1);

    // Raycast from camera through hand position
    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current);
    
    const intersects = raycaster.intersectObject(floorRef.current);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      // Offset Y to draw above the floor
      point.y += 1;

      // Show cursor
      if (cursorSphereRef.current) {
        cursorSphereRef.current.position.copy(point);
        cursorSphereRef.current.visible = true;
      }

      // Create drawing sphere
      if (lastPositionRef.current) {
        const distance = point.distanceTo(lastPositionRef.current);
        
        // Only draw if movement is significant
        if (distance > 0.01 && distance < 0.5) {
          // Create sphere at this position
          const sphereGeometry = new THREE.SphereGeometry(0.02, 8, 8);
          const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2,
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.copy(point);
          sphere.castShadow = true;
          drawGroupRef.current?.add(sphere);

          // Create tube connecting to last position
          const curve = new THREE.LineCurve3(lastPositionRef.current, point);
          const tubeGeometry = new THREE.TubeGeometry(curve, 1, 0.015, 8, false);
          const tubeMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3,
            metalness: 0.8,
            roughness: 0.2,
          });
          const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
          tube.castShadow = true;
          drawGroupRef.current?.add(tube);
        }
      }
      
      lastPositionRef.current = point.clone();
    }
  }, [handData, isDrawing]);

  const handleStartDrawing = () => {
    setDrawingEnabled(true);
    setIsDrawing(true);
    lastPositionRef.current = null;
    toast({
      title: "Drawing Mode Active",
      description: "Move your index finger to draw in 3D space. Camera access required.",
    });
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
    setDrawingEnabled(false);
    lastPositionRef.current = null;
    if (cursorSphereRef.current) {
      cursorSphereRef.current.visible = false;
    }
    toast({
      title: "Drawing Stopped",
      description: "Your artwork has been saved to the canvas.",
    });
  };

  const handleClear = () => {
    if (drawGroupRef.current) {
      while (drawGroupRef.current.children.length > 0) {
        const child = drawGroupRef.current.children[0];
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
        drawGroupRef.current.remove(child);
      }
    }
    lastPositionRef.current = null;
    toast({
      title: "Canvas Cleared",
      description: "All drawings have been removed.",
    });
  };

  const handleExport = () => {
    if (!drawGroupRef.current || drawGroupRef.current.children.length === 0) {
      toast({
        title: "Nothing to Export",
        description: "Draw something first before exporting!",
        variant: "destructive",
      });
      return;
    }

    try {
      const exporter = new OBJExporter();
      const result = exporter.parse(drawGroupRef.current);
      
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `3d-drawing-${Date.now()}.obj`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your 3D drawing has been exported as an OBJ file.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your drawing.",
        variant: "destructive",
      });
    }
  };

  const handleEnterVR = () => {
    const vrButton = document.getElementById('VRButton') as HTMLButtonElement;
    if (vrButton) {
      vrButton.click();
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      
      <DrawingToolbar
        isDrawing={isDrawing}
        isVRSupported={isVRSupported}
        onStartDrawing={handleStartDrawing}
        onStopDrawing={handleStopDrawing}
        onClear={handleClear}
        onExport={handleExport}
        onEnterVR={handleEnterVR}
      />

      {/* Instructions overlay */}
      {!isDrawing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-xl p-6 max-w-md text-center"
        >
          <h3 className="text-lg font-semibold mb-2 neon-text">Ready to Create</h3>
          <p className="text-sm text-muted-foreground">
            Click "Start Drawing" to begin. Move your index finger to draw in 3D space.
            {isVRSupported && " VR mode is available for an immersive experience."}
          </p>
        </motion.div>
      )}

      {/* Hand tracking status */}
      {isDrawing && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-6 right-6 glass rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${handData.isTracking ? 'bg-primary neon-glow-strong' : 'bg-muted'} animate-pulse`} />
            <span className="text-sm font-medium">
              {handData.isTracking ? 'Hand Detected' : 'Searching for Hand...'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HandXRDrawingCanvas;
