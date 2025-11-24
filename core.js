// ===============================
// CESIUM BIM VIEWER - CORE MODULE (v3.3 - iTwin Integration)
// Main viewer initialization and asset management
// Version: 3.3 - Added iTwin Platform support with Share Keys
// ===============================
'use strict';

console.log('🔧 Loading core.js v3.3.1 - Globe Fix for Cesium 1.134');

// ===============================
// CONFIGURATION
// ===============================
const CONFIG = {
  cesium: {
    ION_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMDkwZDM4OC00NzRhLTQyMmYtOTI2ZS02NGZiM2Q2MTE2OGMiLCJpZCI6MjYzNTkwLCJpYXQiOjE3NDExNzk0MTB9.jnf8NDf2PoydWpK3mwDkbp8IYIif5T_-Ioy3Bx6n3Cc',
    IMAGERY_ASSET_ID: 3830182,
    GOOGLE_3D_TILES_ASSET_ID: 2275207,
    OSM_BUILDINGS_ASSET_ID: 96188
  },
  
  camera: {
    DEFAULT_POSITION: {
      longitude: 10.9544,
      latitude: 50.7323,
      height: 10000000,  // 10 Millionen Meter für sicheren Globe-View (nicht zu extrem)
      heading: 0,
      pitch: -89  // -89° für Top-Down Ansicht (nicht exakt -90° wegen Gimbal Lock)
    }
  },
  
  performance: {
    presets: {
      PERFORMANCE: {
        name: 'Performance',
        screenSpaceError: 8,
        memoryUsage: 1024,
        shadowSize: 1024,
        lodQuality: 1.0,
        enableSSAO: false,
        enableShadows: false,
        enableFXAA: true,
        enableMSAA: false,
        enableHDR: false,
        enableAtmosphere: true,
        enableLighting: true,
        skipLevelOfDetail: true,
        cullRequestsWhileMoving: true,
        preloadWhenHidden: false,
        preloadFlightDestinations: false,
        dynamicScreenSpaceError: false
      },
      
      BALANCED: {
        name: 'Balanced',
        screenSpaceError: 3,
        memoryUsage: 2048,
        shadowSize: 2048,
        lodQuality: 2.0,
        enableSSAO: false,
        enableShadows: true,
        enableFXAA: true,
        enableMSAA: false,
        enableHDR: true,
        enableAtmosphere: true,
        enableLighting: true,
        skipLevelOfDetail: true,
        cullRequestsWhileMoving: false,
        preloadWhenHidden: true,
        preloadFlightDestinations: false,
        dynamicScreenSpaceError: true
      },
      
      QUALITY: {
        name: 'Quality',
        screenSpaceError: 1.5,
        memoryUsage: 4096,
        shadowSize: 4096,
        lodQuality: 3.0,
        enableSSAO: true,
        enableShadows: true,
        enableFXAA: true,
        enableMSAA: false,
        enableHDR: true,
        enableAtmosphere: true,
        enableLighting: true,
        skipLevelOfDetail: false,
        cullRequestsWhileMoving: false,
        preloadWhenHidden: true,
        preloadFlightDestinations: true,
        dynamicScreenSpaceError: true
      },
      
      ULTRA: {
        name: 'Ultra',
        screenSpaceError: 1.0,
        memoryUsage: 8192,
        shadowSize: 4096,
        lodQuality: 4.0,
        enableSSAO: true,
        enableShadows: true,
        enableFXAA: false,
        enableMSAA: true,
        enableHDR: true,
        enableAtmosphere: true,
        enableLighting: true,
        skipLevelOfDetail: false,
        cullRequestsWhileMoving: false,
        preloadWhenHidden: true,
        preloadFlightDestinations: true,
        dynamicScreenSpaceError: true,
        dynamicScreenSpaceErrorDensity: 0.00278,
        dynamicScreenSpaceErrorFactor: 4.0,
        dynamicScreenSpaceErrorHeightFalloff: 0.25
      }
    }
  }
};

// ===============================
// IFC ENTITY DEFINITIONS
// ===============================
const IFC_ENTITIES = [
  { entity: 'IfcWall', displayName: 'Wall', color: '#B0B0B0', category: 'structure' },
  { entity: 'IfcWallStandardCase', displayName: 'Standard Wall', color: '#A0A0A0', category: 'structure' },
  { entity: 'IfcColumn', displayName: 'Column', color: '#808080', category: 'structure' },
  { entity: 'IfcBeam', displayName: 'Beam', color: '#696969', category: 'structure' },
  { entity: 'IfcSlab', displayName: 'Slab', color: '#C0C0C0', category: 'structure' },
  { entity: 'IfcRoof', displayName: 'Roof', color: '#8B4513', category: 'structure' },
  { entity: 'IfcFooting', displayName: 'Footing', color: '#654321', category: 'structure' },
  { entity: 'IfcPile', displayName: 'Pile', color: '#5C4033', category: 'structure' },
  { entity: 'IfcDoor', displayName: 'Door', color: '#DEB887', category: 'interior' },
  { entity: 'IfcWindow', displayName: 'Window', color: '#87CEEB', category: 'interior' },
  { entity: 'IfcStair', displayName: 'Stair', color: '#D2691E', category: 'interior' },
  { entity: 'IfcRailing', displayName: 'Railing', color: '#A9A9A9', category: 'interior' },
  { entity: 'IfcRamp', displayName: 'Ramp', color: '#CD853F', category: 'interior' },
  { entity: 'IfcCurtainWall', displayName: 'Curtain Wall', color: '#B0E0E6', category: 'interior' },
  { entity: 'IfcPlate', displayName: 'Plate', color: '#D3D3D3', category: 'interior' },
  { entity: 'IfcCovering', displayName: 'Covering', color: '#F5DEB3', category: 'interior' },
  { entity: 'IfcPipeSegment', displayName: 'Pipe Segment', color: '#4169E1', category: 'mep' },
  { entity: 'IfcPipeFitting', displayName: 'Pipe Fitting', color: '#1E90FF', category: 'mep' },
  { entity: 'IfcDuctSegment', displayName: 'Duct Segment', color: '#87CEFA', category: 'mep' },
  { entity: 'IfcDuctFitting', displayName: 'Duct Fitting', color: '#00BFFF', category: 'mep' },
  { entity: 'IfcFlowTerminal', displayName: 'Flow Terminal', color: '#ADD8E6', category: 'mep' },
  { entity: 'IfcCableSegment', displayName: 'Cable Segment', color: '#FFD700', category: 'mep' },
  { entity: 'IfcCableCarrierSegment', displayName: 'Cable Carrier', color: '#FFA500', category: 'mep' },
  { entity: 'IfcLightFixture', displayName: 'Light Fixture', color: '#FFFF00', category: 'mep' },
  { entity: 'IfcSpace', displayName: 'Space', color: '#E0E0E0', category: 'building' },
  { entity: 'IfcBuildingStorey', displayName: 'Building Storey', color: '#D3D3D3', category: 'building' },
  { entity: 'IfcBuilding', displayName: 'Building', color: '#C0C0C0', category: 'building' },
  { entity: 'IfcSite', displayName: 'Site', color: '#90EE90', category: 'building' },
  { entity: 'IfcFurnishingElement', displayName: 'Furniture', color: '#8B4513', category: 'other' },
  { entity: 'IfcBuildingElementProxy', displayName: 'Proxy Element', color: '#A9A9A9', category: 'other' },
  { entity: 'IfcMember', displayName: 'Member', color: '#778899', category: 'other' },
  { entity: 'IfcOpeningElement', displayName: 'Opening', color: '#FFFFFF', category: 'other' }
];

console.log('✅ Config and IFC_ENTITIES loaded');

// ===============================
// MAIN BIM VIEWER OBJECT
// ===============================
const BimViewer = {
  viewer: null,
  availableAssets: [],
  loadedAssets: new Map(),
  nextAssetId: 1,
  firstAssetLoaded: false,
  
  // ✅ NEW: Improved terrain management
  terrain: {
    worldTerrain: null,
    ellipsoid: null,
    current: 'worldTerrain' // 'worldTerrain', 'ellipsoid', or null
  },
  
  // ✅ IMPROVED: Better Google Tiles management
  googleTiles: {
    tileset: null,
    enabled: false,
    isLoading: false
  },
  
  // ✅ IMPROVED: Better OSM Buildings management
  osmBuildings: {
    tileset: null,
    enabled: true,
    isLoading: false
  },
  
  drawing: {
    active: false,
    positions: [],
    polygon: null,
    visible: true,
    clipBoth: false
  },
  
  savedViews: new Map(),
  nextViewSlot: 1,
  
  ifcFilter: {
    enabledEntities: new Set(),
    allEntities: new Set()
  },
  
  performance: {
    fps: 0,
    lastFrameTime: 0
  },
  
  selectedFeature: undefined,
  selectedOriginalColor: new Cesium.Color(),
  
  globeTransparency: {
    enabled: false,
    currentAlpha: 1.0
  },
  
  undergroundMode: {
    enabled: false
  },

  async init() {
    console.log('🚀 Initializing BIM Viewer v3.3.1 (Globe Fix for Cesium 1.134)...');
    
    try {
      Cesium.Ion.defaultAccessToken = CONFIG.cesium.ION_TOKEN;
      
      // ✅ WORKING SOLUTION: Use the initialization from your old core.js
      // Key: baseLayerPicker: true creates automatic base imagery layers!
      console.log('🌍 Loading Cesium World Terrain (Working Method)...');
      
      this.viewer = new Cesium.Viewer('cesiumContainer', {
        // ✅ MODERN: Terrain directly in constructor (Cesium 1.104+)
        terrain: Cesium.Terrain.fromWorldTerrain(),
        baseLayerPicker: true,  // ✅ CRITICAL: This creates default imagery layers!
        geocoder: true,
        homeButton: true,
        sceneModePicker: true,
        navigationHelpButton: true,
        animation: false,
        timeline: true,
        fullscreenButton: true,
        vrButton: false,
        infoBox: false,
        selectionIndicator: false,
        shadows: true,
        shouldAnimate: true,
        sceneMode: Cesium.SceneMode.SCENE3D,
        mapProjection: new Cesium.WebMercatorProjection(),
        skyBox: new Cesium.SkyBox({
          sources: {
            positiveX: 'https://cesium.com/downloads/cesiumjs/releases/1.134/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_px.jpg',
            negativeX: 'https://cesium.com/downloads/cesiumjs/releases/1.134/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_mx.jpg',
            positiveY: 'https://cesium.com/downloads/cesiumjs/releases/1.134/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_py.jpg',
            negativeY: 'https://cesium.com/downloads/cesiumjs/releases/1.134/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_my.jpg',
            positiveZ: 'https://cesium.com/downloads/cesiumjs/releases/1.134/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_pz.jpg',
            negativeZ: 'https://cesium.com/downloads/cesiumjs/releases/1.134/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_mz.jpg'
          }
        }),
        msaaSamples: 4,
        requestRenderMode: false,
        maximumRenderTimeChange: Infinity
      });
      
      console.log('✅ Viewer created with World Terrain (Working Method from your old core.js)');
      
      // ✅ Add Rendering Error Handler to catch Property/Semantic errors
      this.viewer.scene.renderError.addEventListener((scene, error) => {
        console.error('🔴 Cesium Rendering Error:', error);
        console.error('   Error Type:', error.name);
        console.error('   Message:', error.message);
        
        // Check if it's a property-related error
        if (error.message && error.message.includes('propertiesBySemantic')) {
          console.warn('⚠️ Property/Semantic error detected - attempting to continue rendering...');
          console.warn('   This asset may have invalid or missing property definitions.');
          console.warn('   The asset will still be visible but some features may not work.');
        }
        
        // Attempt to restart rendering
        try {
          console.log('🔄 Attempting to restart rendering...');
          scene.requestRender();
          this.updateStatus('Rendering error occurred - attempting recovery', 'error');
        } catch (restartError) {
          console.error('❌ Failed to restart rendering:', restartError);
          this.updateStatus('Critical rendering error - page reload may be required', 'error');
        }
      });
      
      console.log('✅ Rendering error handler installed');
      
      // ✅ Store reference to terrain (already loaded by viewer)
      this.terrain.worldTerrain = this.viewer.scene.terrain;
      this.terrain.current = 'worldTerrain';
      
      // ✅ Create ellipsoid terrain provider for fallback
      this.terrain.ellipsoid = new Cesium.EllipsoidTerrainProvider();
      
      // ✅ Add your Bing Aerial Maps (Asset ID 2) as additional layer
      try {
        console.log('📷 Loading Bing Aerial Maps (Asset ID 2)...');
        const bingImagery = await Cesium.IonImageryProvider.fromAssetId(2);
        this.viewer.imageryLayers.addImageryProvider(bingImagery);
        console.log('✅ Bing Aerial Maps added successfully');
      } catch (error) {
        console.warn('⚠️ Could not load Bing Maps, trying fallback:', error.message);
        try {
          const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(CONFIG.cesium.IMAGERY_ASSET_ID);
          this.viewer.imageryLayers.addImageryProvider(imageryProvider);
          console.log('✅ Fallback imagery added');
        } catch (fallbackError) {
          console.warn('⚠️ Using OSM imagery as last resort');
          this.viewer.imageryLayers.addImageryProvider(
            new Cesium.OpenStreetMapImageryProvider({
              url: 'https://a.tile.openstreetmap.org/'
            })
          );
        }
      }

      const scene = this.viewer.scene;
      
      // ✅ CRITICAL: Ensure globe is visible
      scene.globe.show = true;
      scene.globe.enableLighting = true;
      scene.globe.depthTestAgainstTerrain = true;
      
      // ✅ CRITICAL: Ensure sky and atmosphere are visible
      scene.skyBox.show = true;
      scene.skyAtmosphere.show = true;
      
      // ✅ CRITICAL: Ensure scene lighting
      scene.sun.show = true;
      scene.moon.show = true;
      
      console.log('✅ Globe, sky, and atmosphere configured and enabled');
      console.log(`   - Globe visible: ${scene.globe.show}`);
      console.log(`   - SkyBox visible: ${scene.skyBox.show}`);
      console.log(`   - Atmosphere visible: ${scene.skyAtmosphere.show}`);
      console.log(`   - Imagery Layers: ${this.viewer.imageryLayers.length}`);
      
      // With baseLayerPicker: true, we should always have imagery layers
      // Only apply emergency fix if something is really wrong
      setTimeout(() => {
        const layerCount = this.viewer.imageryLayers.length;
        console.log(`🔍 Verifying imagery layers: ${layerCount}`);
        
        if (layerCount === 0) {
          console.error('❌ CRITICAL: No imagery layers despite baseLayerPicker: true!');
          console.warn('⚠️ Applying emergency fix...');
          this.fixGlobeVisibility();
        } else {
          console.log(`✅ Globe working correctly (${layerCount} layer(s) loaded)`);
        }
      }, 1000);
      
      this.initIFCFilter();
      this.initCamera();
      this.initZOffset();

      console.log('✅ BIM Viewer initialized successfully');
      this.updateStatus('BIM Viewer ready', 'success');
      
      // Initialize Ion Measurements if available
      if (typeof this.initIonMeasurements === 'function') {
        this.initIonMeasurements();
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize viewer:', error);
      this.updateStatus(`Initialization failed: ${error.message}`, 'error');
      throw error;
    }
  },

  initCamera() {
    const {longitude, latitude, height, heading, pitch} = CONFIG.camera.DEFAULT_POSITION;
    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(pitch),
        roll: 0
      }
    });
  },

  async toggleGoogle3DTiles() {
    if (this.googleTiles.isLoading) {
      console.log('⏳ Google 3D Tiles already loading...');
      return;
    }

    if (!this.googleTiles.tileset) {
      try {
        this.googleTiles.isLoading = true;
        this.updateStatus('Loading Google 3D Tiles...', 'loading');
        console.log('🌍 Loading Google 3D Tiles...');
        
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(CONFIG.cesium.GOOGLE_3D_TILES_ASSET_ID);
        
        this.viewer.scene.primitives.add(tileset);
        
        // ⭐ Enable lighting for Google 3D Tiles
        this.enableTilesetLighting(tileset);
        
        this.googleTiles.tileset = tileset;
        this.googleTiles.enabled = true;
        this.googleTiles.isLoading = false;
        
        // ✅ IMPORTANT: When Google 3D Tiles is enabled, hide globe and imagery
        this.viewer.scene.globe.show = false;
        
        // ✅ Also hide OSM Buildings if loaded
        if (this.osmBuildings.tileset) {
          this.osmBuildings.tileset.show = false;
          this.osmBuildings.enabled = false;
        }
        
        console.log('✅ Google 3D Tiles loaded successfully');
        console.log('   - Globe hidden (using Google 3D Tiles as base)');
        console.log('   - OSM Buildings hidden');
        this.updateStatus('Google 3D Tiles enabled', 'success');
        
      } catch (error) {
        console.error('❌ Failed to load Google 3D Tiles:', error);
        this.googleTiles.isLoading = false;
        this.updateStatus('Failed to load Google 3D Tiles', 'error');
      }
    } else {
      // Toggle existing tileset
      this.googleTiles.enabled = !this.googleTiles.enabled;
      this.googleTiles.tileset.show = this.googleTiles.enabled;
      
      if (this.googleTiles.enabled) {
        // ✅ Enabling Google 3D Tiles: Hide globe and imagery
        this.viewer.scene.globe.show = false;
        
        // Hide OSM Buildings
        if (this.osmBuildings.tileset) {
          this.osmBuildings.tileset.show = false;
          this.osmBuildings.enabled = false;
        }
        
        console.log('🌍 Google 3D Tiles enabled');
        console.log('   - Globe hidden');
        console.log('   - OSM Buildings hidden');
        
      } else {
        // ✅ Disabling Google 3D Tiles: Show globe and imagery again
        this.viewer.scene.globe.show = true;
        
        // Re-enable OSM Buildings if it was loaded before
        if (this.osmBuildings.tileset) {
          this.osmBuildings.tileset.show = true;
          this.osmBuildings.enabled = true;
        }
        
        console.log('🌍 Google 3D Tiles disabled');
        console.log('   - Globe shown');
        console.log('   - OSM Buildings shown');
      }
      
      const status = this.googleTiles.enabled ? 'enabled' : 'disabled';
      this.updateStatus(`Google 3D Tiles ${status}`, 'success');
    }
  },

  async toggleOSMBuildings() {
    if (this.osmBuildings.isLoading) {
      console.log('⏳ OSM Buildings already loading...');
      return;
    }

    // ✅ CHECK: Don't enable OSM Buildings if Google 3D Tiles is active
    if (this.googleTiles.enabled && this.googleTiles.tileset && this.googleTiles.tileset.show) {
      console.warn('⚠️ Google 3D Tiles is active - OSM Buildings should not be used simultaneously');
      this.updateStatus('Disable Google 3D Tiles first', 'warning');
      return;
    }

    if (!this.osmBuildings.tileset) {
      try {
        this.osmBuildings.isLoading = true;
        this.updateStatus('Loading OSM Buildings...', 'loading');
        console.log('🏢 Loading OSM Buildings...');
        
        const tileset = await Cesium.createOsmBuildingsAsync();
        
        this.viewer.scene.primitives.add(tileset);
        
        // ⭐ Enable lighting for OSM Buildings
        this.enableTilesetLighting(tileset);
        
        this.osmBuildings.tileset = tileset;
        this.osmBuildings.enabled = true;
        this.osmBuildings.isLoading = false;
        
        console.log('✅ OSM Buildings loaded successfully');
        this.updateStatus('OSM Buildings enabled', 'success');
        
      } catch (error) {
        console.error('❌ Failed to load OSM Buildings:', error);
        this.osmBuildings.isLoading = false;
        this.updateStatus('Failed to load OSM Buildings', 'error');
      }
    } else {
      this.osmBuildings.enabled = !this.osmBuildings.enabled;
      this.osmBuildings.tileset.show = this.osmBuildings.enabled;
      
      const status = this.osmBuildings.enabled ? 'enabled' : 'disabled';
      console.log(`🏢 OSM Buildings ${status}`);
      this.updateStatus(`OSM Buildings ${status}`, 'success');
    }
  },

  async fetchAvailableAssets() {
    try {
      const response = await fetch(`https://api.cesium.com/v1/assets?access_token=${CONFIG.cesium.ION_TOKEN}`);
      const data = await response.json();
      this.availableAssets = data.items || [];
      return this.availableAssets;
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      throw error;
    }
  },

  async loadSelectedAsset(assetId, assetName = null) {
    if (!assetId || this.loadedAssets.has(assetId.toString())) return;

    try {
      this.updateStatus(`Loading asset ${assetId}...`, 'loading');
      
      const resource = await Cesium.IonResource.fromAssetId(assetId);
      const tileset = await Cesium.Cesium3DTileset.fromUrl(resource, {
        maximumScreenSpaceError: 3,
        maximumMemoryUsage: 2048,
        skipLevelOfDetail: false,
        baseScreenSpaceError: 1024,
        skipScreenSpaceErrorFactor: 16,
        skipLevels: 1,
        immediatelyLoadDesiredLevelOfDetail: false,
        loadSiblings: false,
        cullWithChildrenBounds: true
      });

      // ✅ Add error handler for this specific tileset (with safety checks)
      if (tileset && tileset.tileLoadProgressEvent) {
        tileset.tileLoadProgressEvent.addEventListener((length) => {
          if (length === 0) {
            console.log(`✅ All tiles loaded for asset ${assetId}`);
          }
        });
      }

      if (tileset && tileset.tileFailed) {
        tileset.tileFailed.addEventListener((error) => {
          console.warn(`⚠️ Tile loading failed for asset ${assetId}:`, error);
          // Don't stop rendering, just log the error
        });
      }

      this.viewer.scene.primitives.add(tileset);
      
      // ⭐ Enable lighting for this tileset
      this.enableTilesetLighting(tileset);
      
      const assetData = {
        id: assetId,
        name: assetName || `Asset ${assetId}`,
        tileset: tileset,
        visible: true,
        opacity: 1.0,
        type: '3DTILES',
        ifcPropertyName: undefined  // Will be auto-detected
      };
      
      this.loadedAssets.set(assetId.toString(), assetData);
      await tileset.readyPromise;

      // Apply IFC filter early (will detect properties automatically)
      if (typeof this.applyIFCFilter === 'function') {
        await this.applyIFCFilter();
      }
      
      // Apply point cloud settings if this is a point cloud tileset
      if (typeof this.isPointCloudTileset === 'function' && typeof this.applyPointCloudSettings === 'function') {
        if (this.isPointCloudTileset(tileset)) {
          console.log(`☁️ Detected point cloud tileset - Applying point cloud settings...`);
          this.applyPointCloudSettings(tileset);
          console.log(`✅ Point cloud settings applied to asset ${assetId}`);
        }
      }
      
      
      // Update Z-Offset assets list (with delay to ensure modules are loaded)
      if (typeof BimViewer.updateZOffsetAssetsList === 'function') {
        setTimeout(() => {
          if (typeof BimViewer.updateZOffsetAssetsList === 'function') {
            BimViewer.updateZOffsetAssetsList();
          }
        }, 100);
      }

      if (window.BimViewerUI && typeof BimViewerUI.createAssetControls === 'function') {
        BimViewerUI.createAssetControls(assetId);
      }
      
      if (!this.firstAssetLoaded) {
        this.firstAssetLoaded = true;
        await this.viewer.flyTo(tileset);
      }
      
      this.updateStatus(`Asset loaded: ${assetData.name}`, 'success');
      
      // ✅ CRITICAL: Ensure globe stays visible after asset load
      this.viewer.scene.globe.show = true;
      this.viewer.scene.skyBox.show = true;
      this.viewer.scene.skyAtmosphere.show = true;
      
      // Auto-detect IFC properties after asset is fully loaded
      console.log(`🤖 [Auto-Detect] Starting IFC property detection for asset ${assetId}...`);
      
      setTimeout(async () => {
        try {
          if (typeof this.detectIFCProperties === 'function') {
            console.log(`🔍 [Auto-Detect] Detecting IFC properties for asset ${assetId}...`);
            
            const detectedProp = await this.detectIFCProperties(assetData.tileset);
            
            if (detectedProp) {
              assetData.ifcPropertyName = detectedProp;
              console.log(`✅ [Auto-Detect] Asset ${assetId}: IFC property "${detectedProp}" detected!`);
              
              // Apply filter with detected property
              if (typeof this.applyIFCFilter === 'function') {
                console.log(`🎨 [Auto-Detect] Applying IFC filter for asset ${assetId}...`);
                await this.applyIFCFilter();
                console.log(`✅ [Auto-Detect] IFC filter applied successfully!`);
              }
            } else {
              console.log(`ℹ️ [Auto-Detect] Asset ${assetId}: No IFC properties found`);
              assetData.ifcPropertyName = null;
            }
          } else {
            console.warn(`⚠️ [Auto-Detect] detectIFCProperties function not available yet`);
            console.warn(`⚠️ Make sure features.js is loaded before loading assets`);
          }
        } catch (detectError) {
          console.error(`❌ [Auto-Detect] Detection failed for asset ${assetId}:`, detectError);
          assetData.ifcPropertyName = null;
        }
      }, 3000); // Wait 3 seconds for tiles to fully load
      
    } catch (error) {
      console.error('Failed to load asset:', error);
      this.updateStatus('Failed to load asset', 'error');
    }
  },

  // ✅ NEW: Load iTwin Model with Share Key
  async loadITwinModel(shareKey, iModelId, modelName = null) {
    if (!shareKey || !iModelId) {
      this.updateStatus('❌ Share Key and iModel ID required', 'error');
      return;
    }

    // Check if already loaded
    const assetKey = `itwin_${iModelId}`;
    if (this.loadedAssets.has(assetKey)) {
      this.updateStatus('⚠️ Model already loaded', 'warning');
      return;
    }

    try {
      this.updateStatus(`Loading iTwin Model ${iModelId.substring(0, 8)}...`, 'loading');
      console.log(`🏗️ Loading iTwin Model: ${iModelId}`);
      console.log(`🔑 Using Share Key: ${shareKey.substring(0, 20)}...`);
      
      // ✅ IMPORTANT: Set the share key for this specific iTwin
      Cesium.ITwinPlatform.defaultShareKey = shareKey;
      
      // Load the iModel
      const tileset = await Cesium.ITwinData.createTilesetFromIModelId({
        iModelId: iModelId
      });
      
      if (!tileset) {
        throw new Error('Tileset could not be created - check iModel ID and permissions');
      }
      
      // Apply settings
      tileset.colorBlendMode = Cesium.Cesium3DTileColorBlendMode.REPLACE;
      
      // Add to scene
      this.viewer.scene.primitives.add(tileset);
      
      // ⭐ Enable lighting for this tileset
      this.enableTilesetLighting(tileset);
      
      // Wait for ready, then fly to it
      await tileset.readyPromise;
      
      const assetData = {
        id: assetKey,
        name: modelName || `🏗️ iTwin Model (${iModelId.substring(0, 8)}...)`,
        tileset: tileset,
        visible: true,
        opacity: 1.0,
        type: 'ITWIN',
        iModelId: iModelId,
        shareKey: shareKey, // Store share key for reference
        ifcPropertyName: undefined
      };
      
      this.loadedAssets.set(assetKey, assetData);
      
      // Update Z-Offset assets list (with delay to ensure modules are loaded)
      if (typeof BimViewer.updateZOffsetAssetsList === 'function') {
        setTimeout(() => {
          if (typeof BimViewer.updateZOffsetAssetsList === 'function') {
            BimViewer.updateZOffsetAssetsList();
          }
        }, 100);
      }
      
      
      // ✅ FIX: Fly to model after it's ready
      this.viewer.flyTo(tileset, {
        duration: 2.0,
        offset: new Cesium.HeadingPitchRange(0, -0.5, 500)
      });
      
      // Apply IFC filter if available
      if (typeof this.applyIFCFilter === 'function') {
        setTimeout(() => this.applyIFCFilter(), 1000);
      }
      
      // Create UI controls
      if (window.BimViewerUI && typeof BimViewerUI.createAssetControls === 'function') {
        BimViewerUI.createAssetControls(assetKey);
      }
      
      if (!this.firstAssetLoaded) {
        this.firstAssetLoaded = true;
      }
      
      console.log(`✅ iTwin Model ${iModelId} loaded successfully`);
      this.updateStatus(`✅ iTwin Model loaded successfully`, 'success');
      
      // ✅ CRITICAL: Ensure globe stays visible after model load
      this.viewer.scene.globe.show = true;
      this.viewer.scene.skyBox.show = true;
      this.viewer.scene.skyAtmosphere.show = true;
      console.log('🌍 Globe visibility restored after iTwin model load');
      
      // Auto-detect IFC properties
      setTimeout(async () => {
        try {
          if (typeof this.detectIFCProperties === 'function') {
            console.log(`🔍 [iTwin Auto-Detect] Detecting IFC properties...`);
            const detectedProp = await this.detectIFCProperties(tileset);
            
            if (detectedProp) {
              assetData.ifcPropertyName = detectedProp;
              console.log(`✅ [iTwin Auto-Detect] IFC property "${detectedProp}" detected!`);
              
              if (typeof this.applyIFCFilter === 'function') {
                await this.applyIFCFilter();
              }
            } else {
              console.log(`ℹ️ [iTwin Auto-Detect] No IFC properties found`);
            }
          }
        } catch (error) {
          console.error(`❌ [iTwin Auto-Detect] Detection failed:`, error);
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ iTwin Model import error:', error);
      console.log(`🔍 Debug Info:
        - iModel ID: ${iModelId}
        - Share Key Available: ${shareKey ? 'YES' : 'NO'}
        - Error Type: ${error.name}
        - Error Message: ${error.message}`);
      
      let errorMessage = 'iTwin import failed';
      let errorDetails = error.message;
      
      if (error.message.includes('unauthorized') || error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = '🔐 Access Denied';
        errorDetails = 'Check iTwin Share Key and Model permissions. The model may be private or the share key may be expired.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage = '❓ Model Not Found';
        errorDetails = 'iModel ID not found. Check if the ID is correct and the model exists.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '🌐 Network Error';
        errorDetails = 'Network connection issue. Check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = '⏱️ Request Timeout';
        errorDetails = 'Request timed out. The model may be large or server is busy. Try again later.';
      } else if (error.message.includes('token') || error.message.includes('key')) {
        errorMessage = '🔑 Authentication Error';
        errorDetails = 'Invalid or expired Share Key. Please check your iTwin platform credentials.';
      }
      
      this.updateStatus(`${errorMessage}: ${errorDetails}`, 'error');
      console.log(`💡 Suggested actions:
        - Verify iModel ID is correct
        - Check Share Key expiration
        - Confirm model permissions
        - Try again with different model`);
    }
  },

  unloadAsset(assetId) {
    const assetData = this.loadedAssets.get(assetId.toString());
    if (!assetData) return;

    if (assetData.tileset) {
      this.viewer.scene.primitives.remove(assetData.tileset);
    }
    
    this.loadedAssets.delete(assetId.toString());
    
    // Update Z-Offset assets list (with delay to ensure modules are loaded)
    if (typeof BimViewer.updateZOffsetAssetsList === 'function') {
      setTimeout(() => {
        if (typeof BimViewer.updateZOffsetAssetsList === 'function') {
          BimViewer.updateZOffsetAssetsList();
        }
      }, 100);
    }
    
    
    const assetDiv = document.getElementById(`asset_${assetId}`);
    if (assetDiv) assetDiv.remove();
    
    this.updateStatus(`Asset unloaded`, 'success');
  },

  zoomToAsset(assetId) {
    const assetData = this.loadedAssets.get(assetId.toString());
    if (assetData && assetData.tileset) {
      this.viewer.flyTo(assetData.tileset);
    }
  },

  toggleAssetVisibility(assetId) {
    const assetData = this.loadedAssets.get(assetId.toString());
    if (!assetData) return;

    assetData.visible = !assetData.visible;
    assetData.tileset.show = assetData.visible;
    
    const btn = document.querySelector(`#asset_${assetId} .asset-btn-visibility`);
    if (btn) btn.textContent = assetData.visible ? '👁️' : '🚫';
  },

  updateAssetOpacity(assetId, opacity) {
    const assetData = this.loadedAssets.get(assetId.toString());
    if (!assetData) return;

    assetData.opacity = parseFloat(opacity);
    
    const valueEl = document.getElementById(`opacityValue_${assetId}`);
    if (valueEl) valueEl.textContent = Math.round(opacity * 100) + '%';
    
    if (typeof this.applyIFCFilter === 'function') {
      this.applyIFCFilter();
    }
  },

  initIFCFilter() {
    IFC_ENTITIES.forEach(entity => {
      this.ifcFilter.allEntities.add(entity.entity);
      this.ifcFilter.enabledEntities.add(entity.entity);
    });
  },

  applyPerformanceSettings(settings) {
    const scene = this.viewer.scene;
    scene.postProcessStages.fxaa.enabled = settings.enableFXAA;
    scene.msaaSamples = settings.enableMSAA ? 4 : 1;
    scene.highDynamicRange = settings.enableHDR;
    scene.globe.enableLighting = settings.enableLighting;
    scene.skyAtmosphere.show = settings.enableAtmosphere;
    scene.shadowMap.enabled = settings.enableShadows;
  },

  toggleGlobeTransparency() {
    this.globeTransparency.enabled = !this.globeTransparency.enabled;
    this.viewer.scene.globe.translucency.enabled = this.globeTransparency.enabled;
    
    if (this.globeTransparency.enabled) {
      this.setGlobeTransparency(this.globeTransparency.currentAlpha);
    }
  },

  setGlobeTransparency(alpha) {
    this.globeTransparency.currentAlpha = alpha;
    const globe = this.viewer.scene.globe;
    globe.translucency.enabled = true;
    globe.translucency.frontFaceAlpha = alpha;
    globe.translucency.backFaceAlpha = alpha;
  },

  setGlobeFadeByDistance(nearDistance, nearAlpha, farDistance, farAlpha) {
    const globe = this.viewer.scene.globe;
    
    if (nearDistance === null) {
      globe.translucency.frontFaceAlphaByDistance = undefined;
      globe.translucency.backFaceAlphaByDistance = undefined;
      return;
    }
    
    globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(nearDistance, nearAlpha, farDistance, farAlpha);
    globe.translucency.backFaceAlphaByDistance = new Cesium.NearFarScalar(nearDistance, nearAlpha, farDistance, farAlpha);
  },

  toggleUndergroundView() {
    this.undergroundMode.enabled = !this.undergroundMode.enabled;
    const scene = this.viewer.scene;
    
    scene.screenSpaceCameraController.enableCollisionDetection = !this.undergroundMode.enabled;
    scene.globe.depthTestAgainstTerrain = !this.undergroundMode.enabled;
    this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = this.undergroundMode.enabled ? 0.1 : 1.0;
  },

  flyToUnderground(longitude, latitude, height, heading = 0, pitch = -45) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(pitch),
        roll: 0.0
      },
      duration: 3.0
    });
  },

  updateStatus(message, type = 'success') {
    const statusIndicator = document.querySelector('.status-indicator');
    if (!statusIndicator) return;
    
    statusIndicator.textContent = message;
    statusIndicator.className = `status-indicator ${type}`;
    statusIndicator.style.display = 'block';
    
    setTimeout(() => {
      statusIndicator.style.display = 'none';
    }, 3000);
  },

  // ⭐ NEW: Enable lighting for newly added tileset (for dynamic sun-based lighting)
  enableTilesetLighting(tileset) {
    if (!tileset) return;
    
    try {
      // Enable image-based lighting (responds to sun position)
      if (tileset.imageBasedLighting) {
        tileset.imageBasedLighting.enabled = true;
        tileset.imageBasedLighting.luminanceAtZenith = 0.5;
      }
      
      // Enable shadows if lighting system is enabled
      if (this.lighting?.enabled) {
        tileset.shadows = Cesium.ShadowMode.ENABLED;
      }
      
      console.log('💡 Lighting enabled for tileset');
    } catch (error) {
      console.warn('Could not enable lighting for tileset:', error.message);
    }
  },

  updateModeIndicator() {
    const indicator = document.getElementById('modeIndicator');
    if (indicator && this.drawing.active) {
      indicator.classList.add('active');
      indicator.innerHTML = `✏️ DRAWING MODE - Points: ${this.drawing.positions.length}`;
    } else if (indicator) {
      indicator.classList.remove('active');
    }
  },

  updateClippingModeUI() {
    const btn = document.getElementById('toggleClipMode');
    if (btn) {
      btn.textContent = this.drawing.clipBoth ? '🌍 Buildings + Terrain' : '🏙️ Buildings Only';
      btn.classList.toggle('active', this.drawing.clipBoth);
    }
  },

  // ✅ NEW: Helper function to fix globe visibility issues
  fixGlobeVisibility() {
    console.log('🔧 Fixing globe visibility...');
    const scene = this.viewer.scene;
    
    scene.globe.show = true;
    scene.skyBox.show = true;
    scene.skyAtmosphere.show = true;
    scene.sun.show = true;
    scene.moon.show = true;
    
    // Ensure at least one imagery layer exists
    if (this.viewer.imageryLayers.length === 0) {
      console.log('📷 No imagery layers found, adding fallback imagery...');
      try {
        // Try OpenStreetMap as reliable fallback
        const osmProvider = new Cesium.OpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/'
        });
        this.viewer.imageryLayers.addImageryProvider(osmProvider);
        console.log('✅ OpenStreetMap imagery added successfully');
      } catch (error) {
        console.error('❌ Failed to add OSM imagery:', error.message);
        try {
          // Last resort: Try Cesium's default
          const defaultImagery = Cesium.createWorldImagery();
          this.viewer.imageryLayers.addImageryProvider(defaultImagery);
          console.log('✅ Default Cesium imagery added successfully');
        } catch (fallbackError) {
          console.error('❌ Failed to add any imagery:', fallbackError.message);
        }
      }
    } else {
      console.log(`✅ Imagery layers already present: ${this.viewer.imageryLayers.length}`);
    }
    
    // Force a render update
    scene.requestRender();
    
    console.log('✅ Globe visibility fix completed!');
    console.log(`   - Globe: ${scene.globe.show}`);
    console.log(`   - SkyBox: ${scene.skyBox.show}`);
    console.log(`   - Atmosphere: ${scene.skyAtmosphere.show}`);
    console.log(`   - Imagery Layers: ${this.viewer.imageryLayers.length}`);
    
    this.updateStatus('Globe visibility restored', 'success');
  }
};

// Expose globally
window.BimViewer = BimViewer;
window.CONFIG = CONFIG;
window.IFC_ENTITIES = IFC_ENTITIES;

console.log('✅ BimViewer object created and exposed globally');

// ✅ Global Error Handler for Property/Semantic errors
window.addEventListener('error', function(event) {
  if (event.error && event.error.message && event.error.message.includes('propertiesBySemantic')) {
    console.warn('⚠️ GLOBAL: Property/Semantic error caught globally');
    console.warn('   Error:', event.error.message);
    console.warn('   This asset may have invalid property definitions but will remain visible');
    
    // Prevent the error from stopping everything
    event.preventDefault();
    event.stopPropagation();
    
    // Try to restart rendering if viewer exists
    if (window.BimViewer && window.BimViewer.viewer) {
      try {
        window.BimViewer.viewer.scene.requestRender();
        console.log('🔄 Rendering restarted after property error');
      } catch (restartError) {
        console.error('Failed to restart rendering:', restartError);
      }
    }
    
    return false; // Prevent default error handling
  }
}, true); // Use capture phase

console.log('✅ Global property error handler installed');

// Initialize
let initStarted = false;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!initStarted) {
      initStarted = true;
      BimViewer.init();
    }
  });
} else {
  if (!initStarted) {
    initStarted = true;
    BimViewer.init();
  }
}

console.log('✅ Core module v3.3.1 loaded - Globe Fix for Cesium 1.134');
