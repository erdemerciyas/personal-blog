'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Center } from '@react-three/drei';
import { Mesh, BufferGeometry, MeshStandardMaterial, Box3, Vector3 } from 'three';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';

interface ModelProps {
  url: string;
  format: string;
}

// GLTF/GLB modelleri için ayrı bileşen
function GLTFModel({ url }: { url: string }) {
  const meshRef = useRef<Mesh>(null);
  const { scene } = useGLTF(url);

  // Basit rotasyon animasyonu
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Center>
      <primitive 
        ref={meshRef}
        object={scene} 
        scale={1.0}
      />
    </Center>
  );
}

// STL modelleri için bileşen
function STLModel({ url }: { url: string }) {
  const meshRef = useRef<Mesh>(null);
  const geometry = useLoader(STLLoader, url) as BufferGeometry;
  const [processedGeometry, setProcessedGeometry] = useState<BufferGeometry | null>(null);
  const [scale, setScale] = useState(1);

  // Geometry yüklendiğinde merkez ve boyut hesapla
  useEffect(() => {
    if (geometry) {
      // Geometry'yi klonla (orijinalini değiştirmemek için)
      const clonedGeometry = geometry.clone();
      
      // Bounding box hesapla
      clonedGeometry.computeBoundingBox();
      const box = clonedGeometry.boundingBox;
      
      if (box) {
        // Merkez noktasını hesapla
        const centerPoint = new Vector3();
        box.getCenter(centerPoint);
        
        // Boyutu hesapla
        const size = new Vector3();
        box.getSize(size);
        
        // Geometry'yi merkeze translate et
        clonedGeometry.translate(-centerPoint.x, -centerPoint.y, -centerPoint.z);
        
        // En büyük boyuta göre scale hesapla
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 2; // Hedef boyut
        const calculatedScale = targetSize / maxDimension;
        
        setScale(calculatedScale);
        setProcessedGeometry(clonedGeometry);
        
        console.log('STL Model Info:', {
          originalCenter: centerPoint,
          size: size,
          maxDimension,
          calculatedScale
        });
      }
    }
  }, [geometry]);

  // Basit rotasyon animasyonu
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!processedGeometry) {
    return (
      <Html center>
        <div className="text-blue-500 text-center p-4 bg-white rounded-lg shadow-lg">
          <p>STL işleniyor...</p>
        </div>
      </Html>
    );
  }

  return (
    <mesh 
      ref={meshRef} 
      geometry={processedGeometry} 
      scale={scale}
    >
      <meshStandardMaterial color="#8B5CF6" />
    </mesh>
  );
}

// OBJ modelleri için bileşen
function OBJModel({ url }: { url: string }) {
  const meshRef = useRef<Mesh>(null);
  const obj = useLoader(OBJLoader, url);
  const [processedObj, setProcessedObj] = useState<any>(null);
  const [scale, setScale] = useState(1);

  // OBJ yüklendiğinde merkez ve boyut hesapla
  useEffect(() => {
    if (obj) {
      // Objeyi klonla
      const clonedObj = obj.clone();
      
      // Bounding box hesapla
      const box = new Box3().setFromObject(clonedObj);
      
      // Merkez noktasını hesapla
      const centerPoint = new Vector3();
      box.getCenter(centerPoint);
      
      // Boyutu hesapla
      const size = new Vector3();
      box.getSize(size);
      
      // Objeyi merkeze translate et
      clonedObj.position.set(-centerPoint.x, -centerPoint.y, -centerPoint.z);
      
      // En büyük boyuta göre scale hesapla
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 2; // Hedef boyut
      const calculatedScale = targetSize / maxDimension;
      
      setScale(calculatedScale);
      
      // OBJ dosyasına material ekle
      clonedObj.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = new MeshStandardMaterial({ color: '#10B981' });
        }
      });
      
      setProcessedObj(clonedObj);
      
      console.log('OBJ Model Info:', {
        originalCenter: centerPoint,
        size: size,
        maxDimension,
        calculatedScale
      });
    }
  }, [obj]);

  // Basit rotasyon animasyonu
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!processedObj) {
    return (
      <Html center>
        <div className="text-blue-500 text-center p-4 bg-white rounded-lg shadow-lg">
          <p>OBJ işleniyor...</p>
        </div>
      </Html>
    );
  }

  return (
    <primitive 
      ref={meshRef}
      object={processedObj} 
      scale={scale}
    />
  );
}

// Error boundary bileşeni
function ModelErrorBoundary({ children, format }: { children: React.ReactNode; format: string }) {
  return (
    <Suspense fallback={
      <Html center>
        <div className="text-blue-500 text-center p-4 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>{format.toUpperCase()} Model Yükleniyor...</p>
        </div>
      </Html>
    }>
      {children}
    </Suspense>
  );
}

// Ana model bileşeni
function Model({ url, format }: ModelProps) {
  console.log('3DModelViewer - Loading model:', { url, format });
  
  const renderModel = () => {
    switch (format.toLowerCase()) {
      case 'gltf':
      case 'glb':
        return <GLTFModel url={url} />;
      
      case 'stl':
        return <STLModel url={url} />;
      
      case 'obj':
        return <OBJModel url={url} />;
      
      default:
        return (
          <Html center>
            <div className="text-yellow-600 text-center p-4 bg-white rounded-lg shadow-lg">
              <p>{format.toUpperCase()} Önizleme</p>
              <p className="text-sm text-gray-500 mt-2">
                Bu format için önizleme henüz desteklenmiyor
              </p>
            </div>
          </Html>
        );
    }
  };

  return (
    <ModelErrorBoundary format={format}>
      {renderModel()}
    </ModelErrorBoundary>
  );
}

interface ModelViewerProps {
  modelUrl: string;
  format: string;
  className?: string;
}

export default function ModelViewer({ modelUrl, format, className = '' }: ModelViewerProps) {
  console.log('ModelViewer - Rendering:', { modelUrl, format, className });
  
  return (
    <>
      <div 
        className={`w-full h-96 bg-gray-100 rounded-lg overflow-hidden ${className}`}
        role="img"
        aria-label={`3D ${format.toUpperCase()} Model Görüntüleyici`}
      >
        <Canvas
        camera={{ position: [3, 3, 3], fov: 60 }}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        onCreated={(_state) => {
          // Kamerayı modele odakla
          _state.camera.lookAt(0, 0, 0);
          console.log('Canvas created:', _state);
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={
          <Html center>
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>3D Model Yükleniyor...</p>
            </div>
          </Html>
        }>
          <Model url={modelUrl} format={format} />
        </Suspense>
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={10}
          target={[0, 0, 0]}
          autoRotate={false}
        />
      </Canvas>
      </div>
      <p className="sr-only">3D {format.toUpperCase()} model - Döndürmek için fare ya da dokunmayı kullanın, zoom için tekerlek ya da pinch hareketi</p>
    </>
  );
}

// GLTF loader için preload
// Note: preload function is intentionally empty and used for type declaration
// eslint-disable-next-line @typescript-eslint/no-empty-function
useGLTF.preload = (_url: string) => {};
