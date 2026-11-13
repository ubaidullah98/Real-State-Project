import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Plot, PlotStatus } from '../../types';
import { getPlotStatusColor, formatPKR } from '../../lib/utils';
import {
  Maximize2,
  Minimize2,
  Compass,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Search,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface ThreePlotMapProps {
  plots: Plot[];
  onSelectPlot: (plot: Plot) => void;
  selectedPlot: Plot | null;
  projectName?: string;
}

export const ThreePlotMap: React.FC<ThreePlotMapProps> = ({
  plots,
  onSelectPlot,
  selectedPlot,
  projectName = 'Al-Basit Residency',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'perspective' | 'isometric' | 'top'>('perspective');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const plotMeshesMap = useRef<Map<string, THREE.Group>>(new Map());
  const highlightBeaconRef = useRef<THREE.Mesh | null>(null);
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  // Status counts for legend
  const statusCounts = useMemo(() => {
    const counts: Record<PlotStatus, number> = {
      available: 0,
      reserved: 0,
      sold: 0,
      installments_in_progress: 0,
      overdue: 0,
    };
    plots.forEach((p) => {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    });
    return counts;
  }, [plots]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Initialize Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1120); // Deep luxury dark navy background
    scene.fog = new THREE.FogExp2(0x0a1120, 0.0028);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1500);
    camera.position.set(0, 140, 180);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent going underground
    controls.minDistance = 20;
    controls.maxDistance = 500;
    controls.target.set(0, 0, 10);
    controlsRef.current = controls;

    // Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 0.7);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    dirLight.position.set(100, 180, 80);
    dirLight.castShadow = !isSoftwareGl;
    if (dirLight.shadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 400;
      const d = 160;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    // Ground Terrain (Dark Luxury Slate Foundation with Society Perimeter)
    const groundGeo = new THREE.PlaneGeometry(600, 500);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Society Boundary Wall & Fence
    const wallGeo = new THREE.BoxGeometry(380, 4, 3);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    
    // North wall
    const northWall = new THREE.Mesh(wallGeo, wallMat);
    northWall.position.set(0, 2, -65);
    scene.add(northWall);

    // South wall
    const southWall = new THREE.Mesh(wallGeo, wallMat);
    southWall.position.set(0, 2, 135);
    scene.add(southWall);

    // East & West walls
    const sideWallGeo = new THREE.BoxGeometry(3, 4, 200);
    const eastWall = new THREE.Mesh(sideWallGeo, wallMat);
    eastWall.position.set(190, 2, 35);
    scene.add(eastWall);

    const westWall = new THREE.Mesh(sideWallGeo, wallMat);
    westWall.position.set(-190, 2, 35);
    scene.add(westWall);

    // Main Society Grand Entrance Gate Arch
    const gateGroup = new THREE.Group();
    const pillarGeo = new THREE.BoxGeometry(6, 18, 6);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });
    const p1 = new THREE.Mesh(pillarGeo, pillarMat);
    p1.position.set(-20, 9, 135);
    const p2 = new THREE.Mesh(pillarGeo, pillarMat);
    p2.position.set(20, 9, 135);

    const archBeamGeo = new THREE.BoxGeometry(48, 5, 6);
    const archMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.8 }); // Luxury gold
    const arch = new THREE.Mesh(archBeamGeo, archMat);
    arch.position.set(0, 18, 135);

    gateGroup.add(p1, p2, arch);
    scene.add(gateGroup);

    // Central Boulevard Road (Asphalt)
    const mainRoadGeo = new THREE.PlaneGeometry(28, 200);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
    });
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.05, 35);
    scene.add(mainRoad);

    // Avenue cross roads
    const crossRoad1 = new THREE.Mesh(new THREE.PlaneGeometry(360, 16), roadMat);
    crossRoad1.rotation.x = -Math.PI / 2;
    crossRoad1.position.set(0, 0.05, -25);
    scene.add(crossRoad1);

    const crossRoad2 = new THREE.Mesh(new THREE.PlaneGeometry(360, 16), roadMat);
    crossRoad2.rotation.x = -Math.PI / 2;
    crossRoad2.position.set(0, 0.05, 52);
    scene.add(crossRoad2);

    // Central Society Park / Green Zone
    const parkGeo = new THREE.BoxGeometry(70, 0.4, 45);
    const parkMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Lush Deep Green
      roughness: 0.9,
    });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.set(0, 0.2, 13);
    scene.add(park);

    // Selection Beacon (Glowing gold indicator above selected plot)
    const beaconGeo = new THREE.ConeGeometry(3, 8, 4);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: false });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.rotation.x = Math.PI;
    beacon.position.set(0, 25, 0);
    beacon.visible = false;
    scene.add(beacon);
    highlightBeaconRef.current = beacon;

    // Raycaster for interactive hover/click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      plotMeshesMap.current.forEach((group) => {
        const topSlab = group.getObjectByName('topSlab');
        if (topSlab) meshes.push(topSlab);
      });

      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const plotId = hit.userData.plotId;
        const found = plots.find((p) => p.id === plotId);
        if (found) {
          setHoveredPlot(found);
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredPlot(null);
      renderer.domElement.style.cursor = 'default';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      plotMeshesMap.current.forEach((group) => {
        const topSlab = group.getObjectByName('topSlab');
        if (topSlab) meshes.push(topSlab);
      });

      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const plotId = hit.userData.plotId;
        const found = plots.find((p) => p.id === plotId);
        if (found) {
          onSelectPlot(found);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera transition if target is set
      if (targetCamPos.current && targetLookAt.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetLookAt.current, 0.06);
        if (camera.position.distanceTo(targetCamPos.current) < 0.5) {
          targetCamPos.current = null;
          targetLookAt.current = null;
        }
      }

      controls.update();

      // Spin highlight beacon if visible
      if (beacon.visible) {
        beacon.rotation.y += delta * 2.5;
        beacon.position.y = 14 + Math.sin(clock.getElapsedTime() * 4) * 1.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Plots inside 3D Scene when plots or filter change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous plot meshes
    plotMeshesMap.current.forEach((group) => {
      scene.remove(group);
    });
    plotMeshesMap.current.clear();

    // Helper: generate 2D canvas texture for plot number badge
    const createLabelTexture = (text: string, sub: string, statusColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 128);

        // Header accent bar
        ctx.fillStyle = statusColor;
        ctx.fillRect(0, 0, 256, 14);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 60);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px sans-serif';
        ctx.fillText(sub, 128, 98);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // Filter plots if needed
    const visiblePlots = plots.filter((p) => {
      if (statusFilter === 'all') return true;
      return p.status === statusFilter;
    });

    visiblePlots.forEach((plot) => {
      const group = new THREE.Group();
      const statusMeta = getPlotStatusColor(plot.status);
      const isSelected = selectedPlot?.id === plot.id;

      const w = plot.coordinates.width || 14;
      const d = plot.coordinates.depth || 16;
      const h = isSelected ? 3.5 : 2;

      // Base curb / boundary foundation
      const curbGeo = new THREE.BoxGeometry(w + 1, 0.6, d + 1);
      const curbMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.8,
      });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.y = 0.3;
      group.add(curb);

      // Top Slab (Color-coded Plot Status)
      const slabGeo = new THREE.BoxGeometry(w, h, d);
      const slabMat = new THREE.MeshStandardMaterial({
        color: statusMeta.hex,
        roughness: 0.35,
        metalness: 0.15,
        emissive: isSelected ? statusMeta.hex : 0x000000,
        emissiveIntensity: isSelected ? 0.35 : 0.05,
      });
      const topSlab = new THREE.Mesh(slabGeo, slabMat);
      topSlab.position.y = h / 2 + 0.3;
      topSlab.name = 'topSlab';
      topSlab.userData = { plotId: plot.id };
      topSlab.castShadow = true;
      topSlab.receiveShadow = true;
      group.add(topSlab);

      // Plot Number Label sitting atop the plot
      const hexColorStr = `#${statusMeta.hex.toString(16).padStart(6, '0')}`;
      const labelMat = new THREE.MeshBasicMaterial({
        map: createLabelTexture(plot.plotNumber, plot.plotSize, hexColorStr),
        transparent: true,
      });
      const labelGeo = new THREE.PlaneGeometry(w * 0.75, d * 0.45);
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.rotation.x = -Math.PI / 2;
      labelMesh.position.y = h + 0.32;
      group.add(labelMesh);

      // Category Corner Stone marker for Corner & Boulevard plots
      if (plot.category === 'corner' || plot.category === 'boulevard') {
        const pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.5, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
        const pMarker = new THREE.Mesh(pillarGeo, pillarMat);
        pMarker.position.set(w / 2 - 0.5, 1.75, d / 2 - 0.5);
        group.add(pMarker);
      }

      group.position.set(plot.coordinates.x, 0, plot.coordinates.z);
      scene.add(group);
      plotMeshesMap.current.set(plot.id, group);
    });
  }, [plots, selectedPlot, statusFilter]);

  // Update Highlight Beacon on selected plot
  useEffect(() => {
    if (highlightBeaconRef.current) {
      if (selectedPlot) {
        highlightBeaconRef.current.position.set(
          selectedPlot.coordinates.x,
          16,
          selectedPlot.coordinates.z
        );
        highlightBeaconRef.current.visible = true;

        // Smoothly glide camera focus towards selected plot
        targetCamPos.current = new THREE.Vector3(
          selectedPlot.coordinates.x,
          selectedPlot.coordinates.y + 60,
          selectedPlot.coordinates.z + 75
        );
        targetLookAt.current = new THREE.Vector3(
          selectedPlot.coordinates.x,
          selectedPlot.coordinates.y,
          selectedPlot.coordinates.z
        );
      } else {
        highlightBeaconRef.current.visible = false;
      }
    }
  }, [selectedPlot]);

  // Search by Plot Number handler
  const handleSearchPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = plots.find(
      (p) =>
        p.plotNumber.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        p.blockNumber.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (match) {
      onSelectPlot(match);
    }
  };

  // Camera presets
  const setCameraView = (type: 'isometric' | 'top' | 'front') => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (type === 'top') {
      targetCamPos.current = new THREE.Vector3(0, 220, 10);
      targetLookAt.current = new THREE.Vector3(0, 0, 10);
      setViewMode('top');
    } else if (type === 'isometric') {
      targetCamPos.current = new THREE.Vector3(140, 130, 150);
      targetLookAt.current = new THREE.Vector3(0, 0, 10);
      setViewMode('isometric');
    } else {
      targetCamPos.current = new THREE.Vector3(0, 140, 180);
      targetLookAt.current = new THREE.Vector3(0, 0, 10);
      setViewMode('perspective');
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const factor = direction === 'in' ? 0.75 : 1.35;
    cameraRef.current.position.multiplyScalar(factor);
  };

  const toggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-2xl select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Header & Search Bar */}
      <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-none">
        {/* Project Branding Badge */}
        <div className="pointer-events-auto flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold tracking-wider uppercase">
              Interactive 3D Master Plan
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {projectName}
              <span className="text-[10px] bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {plots.length} Plots
              </span>
            </div>
          </div>
        </div>

        {/* Plot Search Form */}
        <div className="pointer-events-auto flex items-center gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearchPlot} className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search plot (e.g. A-01, B-05)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white pl-9 pr-3 py-2 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 shadow-md"
            />
          </form>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-white/95 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl shadow-md transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Hover Card (Top Right / Center) */}
      {hoveredPlot && (
        <div className="absolute top-20 right-4 pointer-events-none bg-white/95 dark:bg-slate-900/95 border border-amber-500/40 p-3.5 rounded-xl shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Plot {hoveredPlot.plotNumber}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${getPlotStatusColor(hoveredPlot.status).bg} ${getPlotStatusColor(hoveredPlot.status).text}`}>
              {getPlotStatusColor(hoveredPlot.status).label}
            </span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
            <div><span className="text-slate-500">Block:</span> {hoveredPlot.blockNumber}</div>
            <div><span className="text-slate-500">Size:</span> {hoveredPlot.plotSize} ({hoveredPlot.dimensions})</div>
            <div><span className="text-slate-500">Price:</span> <span className="text-amber-600 dark:text-amber-400 font-semibold">{formatPKR(hoveredPlot.totalPlotPrice)}</span></div>
          </div>
          <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-300/80 italic">Click to inspect complete details</div>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Dock (Adhering to Three.js Universal UI Standard) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl pointer-events-auto">
        {/* Toggle Expand/Collapse Drawer Tab */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="px-3 py-1 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-t-lg text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md shadow-md transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Show Controls & Status Legend
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Hide Controls (Cinema View)
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        {!isDockCollapsed && (
          <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/90 rounded-2xl p-3.5 shadow-2xl backdrop-blur-lg flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Filter / Color Legend */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({plots.length})
              </button>

              <button
                onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === 'available'
                    ? 'bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Available ({statusCounts.available})
              </button>

              <button
                onClick={() => setStatusFilter(statusFilter === 'reserved' ? 'all' : 'reserved')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === 'reserved'
                    ? 'bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Reserved ({statusCounts.reserved})
              </button>

              <button
                onClick={() => setStatusFilter(statusFilter === 'installments_in_progress' ? 'all' : 'installments_in_progress')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === 'installments_in_progress'
                    ? 'bg-blue-500/25 text-blue-700 dark:text-blue-300 border-blue-500'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Installments ({statusCounts.installments_in_progress})
              </button>

              <button
                onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === 'overdue'
                    ? 'bg-orange-500/25 text-orange-700 dark:text-orange-300 border-orange-500'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-orange-700 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/10'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                Overdue ({statusCounts.overdue})
              </button>

              <button
                onClick={() => setStatusFilter(statusFilter === 'sold' ? 'all' : 'sold')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === 'sold'
                    ? 'bg-rose-500/25 text-rose-700 dark:text-rose-300 border-rose-500'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Sold ({statusCounts.sold})
              </button>
            </div>

            {/* Camera Angles & Navigation Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCameraView('isometric')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  viewMode === 'isometric' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Isometric 3D Angle"
              >
                <Compass className="w-3.5 h-3.5" /> 3D Iso
              </button>

              <button
                onClick={() => setCameraView('top')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  viewMode === 'top' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Top-Down Aerial Master Plan"
              >
                <Layers className="w-3.5 h-3.5" /> Top View
              </button>

              <button
                onClick={() => setCameraView('front')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  viewMode === 'perspective' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Reset Perspective"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>

              <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-0.5" />

              <button
                onClick={() => handleZoom('in')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleZoom('out')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
