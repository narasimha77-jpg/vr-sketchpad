import { useEffect, useRef, useState } from 'react';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandTrackingResult {
  indexFingerTip: HandLandmark | null;
  isTracking: boolean;
}

declare global {
  interface Window {
    Hands?: any;
    Camera?: any;
    drawingUtils?: any;
  }
}

export const useHandTracking = (enabled: boolean = false) => {
  const [handData, setHandData] = useState<HandTrackingResult>({
    indexFingerTip: null,
    isTracking: false,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) {
      // Clean up when disabled
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      setHandData({ indexFingerTip: null, isTracking: false });
      return;
    }

    let isMounted = true;

    const initHandTracking = async () => {
      try {
        // Load MediaPipe Hands scripts dynamically
        if (!window.Hands) {
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        }

        if (!isMounted) return;

        // Create video element
        const video = document.createElement('video');
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;

        // Initialize MediaPipe Hands
        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          if (!isMounted) return;
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Get index finger tip (landmark 8)
            const indexTip = results.multiHandLandmarks[0][8];
            setHandData({
              indexFingerTip: {
                x: indexTip.x,
                y: indexTip.y,
                z: indexTip.z || 0,
              },
              isTracking: true,
            });
          } else {
            setHandData(prev => ({ ...prev, isTracking: false }));
          }
        });

        handsRef.current = hands;

        // Initialize camera
        const camera = new window.Camera(video, {
          onFrame: async () => {
            if (handsRef.current && isMounted) {
              await handsRef.current.send({ image: video });
            }
          },
          width: 640,
          height: 480
        });

        cameraRef.current = camera;
        await camera.start();

      } catch (error) {
        console.error('Failed to initialize hand tracking:', error);
        setHandData({ indexFingerTip: null, isTracking: false });
      }
    };

    initHandTracking();

    return () => {
      isMounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
    };
  }, [enabled]);

  return handData;
};

// Helper function to load external scripts
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};
