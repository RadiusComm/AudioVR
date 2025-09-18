import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import NetInfo from '@react-native-netinfo/netinfo';

export interface AudioAsset {
  id: string;
  name: string;
  type: 'ambient' | 'sfx' | 'dialogue' | 'music' | 'ui';
  url: string;
  localPath?: string;
  duration?: number;
  size?: number;
  isLooping: boolean;
  volume: number;
  spatialPosition?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface AudioLayer {
  id: string;
  name: string;
  type: 'ambient' | 'sfx' | 'dialogue' | 'music' | 'ui';
  volume: number;
  isMuted: boolean;
  assets: AudioAsset[];
}

export interface SpatialAudioConfig {
  enabled: boolean;
  listenerPosition: { x: number; y: number; z: number };
  listenerOrientation: { forward: { x: number; y: number; z: number }; up: { x: number; y: number; z: number } };
  distanceModel: 'linear' | 'inverse' | 'exponential';
  maxDistance: number;
  rolloffFactor: number;
}

export class AudioAssetManager {
  private audioLayers: Map<string, AudioLayer> = new Map();
  private loadedSounds: Map<string, Audio.Sound> = new Map();
  private spatialConfig: SpatialAudioConfig;
  private masterVolume: number = 1.0;
  private isInitialized: boolean = false;
  private downloadQueue: Set<string> = new Set();
  private cacheDirectory: string;
  private maxCacheSize: number = 500 * 1024 * 1024; // 500MB

  // Event callbacks
  private onAssetLoaded?: (assetId: string) => void;
  private onAssetError?: (assetId: string, error: string) => void;
  private onDownloadProgress?: (assetId: string, progress: number) => void;

  constructor() {
    this.cacheDirectory = `${FileSystem.documentDirectory}audio-cache/`;
    this.spatialConfig = {
      enabled: true,
      listenerPosition: { x: 0, y: 0, z: 0 },
      listenerOrientation: {
        forward: { x: 0, y: 0, z: -1 },
        up: { x: 0, y: 1, z: 0 }
      },
      distanceModel: 'inverse',
      maxDistance: 10,
      rolloffFactor: 1,
    };

    // Initialize default audio layers
    this.initializeDefaultLayers();
  }

  // Initialize the audio system
  async initialize(): Promise<void> {
    try {
      // Set audio mode for optimal playback
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
      });

      // Create cache directory
      await this.ensureCacheDirectory();

      this.isInitialized = true;
      console.log('AudioAssetManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioAssetManager:', error);
      throw error;
    }
  }

  // Set event callbacks
  setEventCallbacks({
    onAssetLoaded,
    onAssetError,
    onDownloadProgress,
  }: {
    onAssetLoaded?: (assetId: string) => void;
    onAssetError?: (assetId: string, error: string) => void;
    onDownloadProgress?: (assetId: string, progress: number) => void;
  }): void {
    this.onAssetLoaded = onAssetLoaded;
    this.onAssetError = onAssetError;
    this.onDownloadProgress = onDownloadProgress;
  }

  // Initialize default audio layers
  private initializeDefaultLayers(): void {
    const layers: AudioLayer[] = [
      {
        id: 'ambient',
        name: 'Ambient Audio',
        type: 'ambient',
        volume: 0.6,
        isMuted: false,
        assets: [],
      },
      {
        id: 'dialogue',
        name: 'Character Dialogue',
        type: 'dialogue',
        volume: 1.0,
        isMuted: false,
        assets: [],
      },
      {
        id: 'sfx',
        name: 'Sound Effects',
        type: 'sfx',
        volume: 0.8,
        isMuted: false,
        assets: [],
      },
      {
        id: 'music',
        name: 'Background Music',
        type: 'music',
        volume: 0.4,
        isMuted: false,
        assets: [],
      },
      {
        id: 'ui',
        name: 'UI Sounds',
        type: 'ui',
        volume: 0.7,
        isMuted: false,
        assets: [],
      },
    ];

    layers.forEach(layer => {
      this.audioLayers.set(layer.id, layer);
    });
  }

  // Ensure cache directory exists
  private async ensureCacheDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
    }
  }

  // Load audio asset
  async loadAudioAsset(asset: AudioAsset, preload: boolean = false): Promise<void> {
    try {
      // Check if already loaded
      if (this.loadedSounds.has(asset.id)) {
        return;
      }

      let soundUri = asset.url;

      // Check if we have a cached version
      if (asset.localPath) {
        const localInfo = await FileSystem.getInfoAsync(asset.localPath);
        if (localInfo.exists) {
          soundUri = asset.localPath;
        }
      }

      // Download and cache if not available locally
      if (!asset.localPath || !(await FileSystem.getInfoAsync(asset.localPath)).exists) {
        const netState = await NetInfo.fetch();
        if (netState.isConnected && !this.downloadQueue.has(asset.id)) {
          this.downloadAudioAsset(asset);
        }
      }

      // Load the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUri },
        {
          shouldPlay: false,
          isLooping: asset.isLooping,
          volume: asset.volume,
        }
      );

      // Set up status update callback
      sound.setOnPlaybackStatusUpdate(this.createPlaybackStatusHandler(asset.id));

      this.loadedSounds.set(asset.id, sound);
      
      // Add to appropriate layer
      const layer = this.audioLayers.get(asset.type);
      if (layer) {
        layer.assets.push(asset);
      }

      this.onAssetLoaded?.(asset.id);
      console.log(`Audio asset loaded: ${asset.name}`);
    } catch (error) {
      console.error(`Failed to load audio asset ${asset.name}:`, error);
      this.onAssetError?.(asset.id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Download and cache audio asset
  private async downloadAudioAsset(asset: AudioAsset): Promise<void> {
    if (this.downloadQueue.has(asset.id)) {
      return;
    }

    this.downloadQueue.add(asset.id);

    try {
      const filename = `${asset.id}.${this.getFileExtension(asset.url)}`;
      const localPath = `${this.cacheDirectory}${filename}`;

      // Check cache size and clean if necessary
      await this.manageCacheSize();

      const downloadResumable = FileSystem.createDownloadResumable(
        asset.url,
        localPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          this.onDownloadProgress?.(asset.id, progress);
        }
      );

      const downloadResult = await downloadResumable.downloadAsync();
      
      if (downloadResult) {
        asset.localPath = downloadResult.uri;
        asset.size = (await FileSystem.getInfoAsync(downloadResult.uri)).size;
        console.log(`Audio asset cached: ${asset.name}`);
      }
    } catch (error) {
      console.error(`Failed to download audio asset ${asset.name}:`, error);
      this.onAssetError?.(asset.id, error instanceof Error ? error.message : 'Download failed');
    } finally {
      this.downloadQueue.delete(asset.id);
    }
  }

  // Manage cache size
  private async manageCacheSize(): Promise<void> {
    const cacheInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
    if (!cacheInfo.exists) {
      return;
    }

    const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
    let totalSize = 0;
    const fileStats: Array<{ name: string; size: number; modificationTime: number }> = [];

    for (const file of files) {
      const filePath = `${this.cacheDirectory}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists && !fileInfo.isDirectory) {
        totalSize += fileInfo.size || 0;
        fileStats.push({
          name: file,
          size: fileInfo.size || 0,
          modificationTime: fileInfo.modificationTime || 0,
        });
      }
    }

    // Remove oldest files if cache exceeds limit
    if (totalSize > this.maxCacheSize) {
      fileStats.sort((a, b) => a.modificationTime - b.modificationTime);
      
      let removedSize = 0;
      for (const file of fileStats) {
        if (totalSize - removedSize <= this.maxCacheSize * 0.8) {
          break;
        }

        try {
          await FileSystem.deleteAsync(`${this.cacheDirectory}${file.name}`);
          removedSize += file.size;
          console.log(`Removed cached file: ${file.name}`);
        } catch (error) {
          console.error(`Failed to remove cached file ${file.name}:`, error);
        }
      }
    }
  }

  // Play audio asset
  async playAudio(
    assetId: string, 
    options: {
      fadeIn?: number;
      startTime?: number;
      volume?: number;
      spatialPosition?: { x: number; y: number; z: number };
    } = {}
  ): Promise<void> {
    const sound = this.loadedSounds.get(assetId);
    if (!sound) {
      throw new Error(`Audio asset ${assetId} not loaded`);
    }

    try {
      // Apply spatial audio if configured
      if (this.spatialConfig.enabled && options.spatialPosition) {
        await this.applySpatialAudio(sound, options.spatialPosition);
      }

      // Set volume
      const volume = options.volume !== undefined ? options.volume : 1.0;
      await sound.setVolumeAsync(volume * this.masterVolume * this.getLayerVolume(assetId));

      // Set position if specified
      if (options.startTime !== undefined) {
        await sound.setPositionAsync(options.startTime);
      }

      // Play with fade-in if specified
      if (options.fadeIn && options.fadeIn > 0) {
        await sound.setVolumeAsync(0);
        await sound.playAsync();
        // Implement fade-in animation
        this.fadeAudio(sound, 0, volume * this.masterVolume * this.getLayerVolume(assetId), options.fadeIn);
      } else {
        await sound.playAsync();
      }

      console.log(`Playing audio: ${assetId}`);
    } catch (error) {
      console.error(`Failed to play audio ${assetId}:`, error);
      throw error;
    }
  }

  // Stop audio asset
  async stopAudio(assetId: string, fadeOut?: number): Promise<void> {
    const sound = this.loadedSounds.get(assetId);
    if (!sound) {
      return;
    }

    try {
      if (fadeOut && fadeOut > 0) {
        // Get current volume
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const currentVolume = status.volume || 0;
          await this.fadeAudio(sound, currentVolume, 0, fadeOut);
        }
      }
      
      await sound.stopAsync();
      console.log(`Stopped audio: ${assetId}`);
    } catch (error) {
      console.error(`Failed to stop audio ${assetId}:`, error);
    }
  }

  // Pause audio asset
  async pauseAudio(assetId: string): Promise<void> {
    const sound = this.loadedSounds.get(assetId);
    if (!sound) {
      return;
    }

    try {
      await sound.pauseAsync();
      console.log(`Paused audio: ${assetId}`);
    } catch (error) {
      console.error(`Failed to pause audio ${assetId}:`, error);
    }
  }

  // Resume audio asset
  async resumeAudio(assetId: string): Promise<void> {
    const sound = this.loadedSounds.get(assetId);
    if (!sound) {
      return;
    }

    try {
      await sound.playAsync();
      console.log(`Resumed audio: ${assetId}`);
    } catch (error) {
      console.error(`Failed to resume audio ${assetId}:`, error);
    }
  }

  // Set master volume
  async setMasterVolume(volume: number): Promise<void> {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Update all currently playing sounds
    for (const [assetId, sound] of this.loadedSounds) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          const layerVolume = this.getLayerVolume(assetId);
          await sound.setVolumeAsync(this.masterVolume * layerVolume);
        }
      } catch (error) {
        console.error(`Failed to update volume for ${assetId}:`, error);
      }
    }
  }

  // Set layer volume
  async setLayerVolume(layerId: string, volume: number): Promise<void> {
    const layer = this.audioLayers.get(layerId);
    if (!layer) {
      return;
    }

    layer.volume = Math.max(0, Math.min(1, volume));

    // Update all sounds in this layer
    for (const asset of layer.assets) {
      const sound = this.loadedSounds.get(asset.id);
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await sound.setVolumeAsync(asset.volume * this.masterVolume * layer.volume);
          }
        } catch (error) {
          console.error(`Failed to update volume for ${asset.id}:`, error);
        }
      }
    }
  }

  // Mute/unmute layer
  async toggleLayerMute(layerId: string): Promise<boolean> {
    const layer = this.audioLayers.get(layerId);
    if (!layer) {
      return false;
    }

    layer.isMuted = !layer.isMuted;
    const volume = layer.isMuted ? 0 : layer.volume;

    // Update all sounds in this layer
    for (const asset of layer.assets) {
      const sound = this.loadedSounds.get(asset.id);
      if (sound) {
        try {
          await sound.setVolumeAsync(asset.volume * this.masterVolume * volume);
        } catch (error) {
          console.error(`Failed to mute/unmute ${asset.id}:`, error);
        }
      }
    }

    return layer.isMuted;
  }

  // Apply spatial audio positioning
  private async applySpatialAudio(
    sound: Audio.Sound,
    position: { x: number; y: number; z: number }
  ): Promise<void> {
    if (!this.spatialConfig.enabled) {
      return;
    }

    // Calculate distance from listener
    const listener = this.spatialConfig.listenerPosition;
    const distance = Math.sqrt(
      Math.pow(position.x - listener.x, 2) +
      Math.pow(position.y - listener.y, 2) +
      Math.pow(position.z - listener.z, 2)
    );

    // Apply distance attenuation
    let volume = 1.0;
    if (distance > 0) {
      switch (this.spatialConfig.distanceModel) {
        case 'linear':
          volume = Math.max(0, 1 - (distance / this.spatialConfig.maxDistance));
          break;
        case 'inverse':
          volume = 1 / (1 + this.spatialConfig.rolloffFactor * distance);
          break;
        case 'exponential':
          volume = Math.pow(distance / this.spatialConfig.maxDistance, -this.spatialConfig.rolloffFactor);
          break;
      }
    }

    // Apply volume based on distance
    await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));

    // Note: Advanced spatial audio features like panning and HRTF
    // would require native audio processing or Web Audio API integration
    console.log(`Applied spatial audio: distance=${distance.toFixed(2)}, volume=${volume.toFixed(2)}`);
  }

  // Fade audio volume
  private async fadeAudio(
    sound: Audio.Sound,
    fromVolume: number,
    toVolume: number,
    duration: number
  ): Promise<void> {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = (toVolume - fromVolume) / steps;

    for (let i = 0; i <= steps; i++) {
      const currentVolume = fromVolume + (volumeStep * i);
      await sound.setVolumeAsync(Math.max(0, Math.min(1, currentVolume)));
      
      if (i < steps) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
  }

  // Get layer volume for an asset
  private getLayerVolume(assetId: string): number {
    for (const layer of this.audioLayers.values()) {
      const asset = layer.assets.find(a => a.id === assetId);
      if (asset) {
        return layer.isMuted ? 0 : layer.volume;
      }
    }
    return 1.0;
  }

  // Create playback status handler
  private createPlaybackStatusHandler(assetId: string) {
    return (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        // Handle playback events
        if (status.didJustFinish) {
          console.log(`Audio finished: ${assetId}`);
        }
        if (status.error) {
          console.error(`Audio playback error for ${assetId}:`, status.error);
          this.onAssetError?.(assetId, status.error);
        }
      }
    };
  }

  // Get file extension from URL
  private getFileExtension(url: string): string {
    const match = url.match(/\.([^.?]+)(\?|$)/);
    return match ? match[1] : 'mp3';
  }

  // Get audio layers
  getAudioLayers(): AudioLayer[] {
    return Array.from(this.audioLayers.values());
  }

  // Get loaded assets
  getLoadedAssets(): AudioAsset[] {
    const assets: AudioAsset[] = [];
    for (const layer of this.audioLayers.values()) {
      assets.push(...layer.assets);
    }
    return assets;
  }

  // Update spatial config
  updateSpatialConfig(config: Partial<SpatialAudioConfig>): void {
    this.spatialConfig = { ...this.spatialConfig, ...config };
  }

  // Preload case assets
  async preloadCaseAssets(caseId: string, assets: AudioAsset[]): Promise<void> {
    console.log(`Preloading ${assets.length} assets for case ${caseId}`);
    
    const loadPromises = assets.map(asset => 
      this.loadAudioAsset(asset, true).catch(error => {
        console.error(`Failed to preload asset ${asset.id}:`, error);
      })
    );

    await Promise.allSettled(loadPromises);
    console.log(`Finished preloading assets for case ${caseId}`);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    // Stop and unload all sounds
    for (const [assetId, sound] of this.loadedSounds) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error(`Failed to cleanup audio ${assetId}:`, error);
      }
    }

    this.loadedSounds.clear();
    this.downloadQueue.clear();
    
    // Clear audio layers
    for (const layer of this.audioLayers.values()) {
      layer.assets = [];
    }

    this.isInitialized = false;
    console.log('AudioAssetManager cleanup completed');
  }
}

export default AudioAssetManager;