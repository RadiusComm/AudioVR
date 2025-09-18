import TrackPlayer, { 
  Capability, 
  Event, 
  RepeatMode, 
  State,
  Track,
  AppKilledPlaybackBehavior 
} from 'react-native-track-player';
import Sound from 'react-native-sound';
import { Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AudioAsset {
  id: string;
  name: string;
  category: 'dialogue' | 'ambient' | 'effects' | 'music' | 'ui';
  type: 'stream' | 'sample' | 'loop';
  url: string;
  localPath?: string;
  format: 'mp3' | 'ogg' | 'wav' | 'aac';
  quality: 64 | 128 | 192 | 256 | 320; // kbps
  duration?: number; // seconds
  size?: number; // bytes
  spatial?: {
    position: { x: number; y: number; z: number };
    distance?: number;
    directional?: boolean;
  };
  metadata?: {
    character?: string;
    location?: string;
    mood?: string;
    language?: string;
    accessibility?: string;
  };
}

export interface AudioLayer {
  name: string;
  priority: number;
  volume: number;
  enabled: boolean;
  tracks: AudioAsset[];
  mixingMode: 'always' | 'triggered' | 'ducking' | 'adaptive';
  spatialProcessing: boolean;
}

export interface SpatialAudioConfig {
  enabled: boolean;
  listenerPosition: { x: number; y: number; z: number };
  listenerOrientation: { x: number; y: number; z: number };
  environmentType: 'train' | 'mansion' | 'outdoor' | 'small-room' | 'space-station';
  reverbEnabled: boolean;
  occlusionEnabled: boolean;
}

export interface AudioServiceConfig {
  cdnBaseUrl: string;
  cacheEnabled: boolean;
  maxCacheSize: number; // MB
  adaptiveBitrate: boolean;
  spatialAudio: SpatialAudioConfig;
  accessibilityMode: boolean;
  offlineMode: boolean;
}

export class AudioVRService {
  private isInitialized = false;
  private config: AudioServiceConfig;
  private audioLayers: Map<string, AudioLayer> = new Map();
  private loadedSounds: Map<string, Sound> = new Map();
  private currentTracks: Map<string, string> = new Map(); // layer -> trackId
  private volumeLevels: Map<string, number> = new Map();
  private spatialSources: Map<string, any> = new Map(); // Web Audio API nodes
  private audioContext: any = null; // Web Audio API context (for web platform)
  
  // Event callbacks
  private onAudioLoad?: (assetId: string) => void;
  private onAudioError?: (error: string) => void;
  private onCacheUpdate?: (progress: number) => void;

  constructor(config: Partial<AudioServiceConfig> = {}) {
    this.config = {
      cdnBaseUrl: 'https://audio-cdn.audiovr.app',
      cacheEnabled: true,
      maxCacheSize: 500, // MB
      adaptiveBitrate: true,
      spatialAudio: {
        enabled: true,
        listenerPosition: { x: 0, y: 0, z: 0 },
        listenerOrientation: { x: 0, y: 0, z: -1 },
        environmentType: 'train',
        reverbEnabled: true,
        occlusionEnabled: false,
      },
      accessibilityMode: false,
      offlineMode: false,
      ...config,
    };

    this.initializeAudioLayers();
  }

  // Initialize the audio service
  async initialize(): Promise<void> {
    try {
      // Initialize TrackPlayer for background audio
      await TrackPlayer.setupPlayer({});
      
      // Configure TrackPlayer capabilities
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
        progressUpdateEventInterval: 1,
      });

      // Initialize Sound library for sound effects
      Sound.setCategory('Playback');
      
      // Initialize spatial audio if supported
      if (this.config.spatialAudio.enabled && Platform.OS === 'web') {
        await this.initializeSpatialAudio();
      }

      // Load essential assets
      await this.loadEssentialAssets();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('AudioVR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
      this.onAudioError?.(error instanceof Error ? error.message : 'Audio initialization failed');
    }
  }

  // Initialize default audio layers
  private initializeAudioLayers(): void {
    const layers: AudioLayer[] = [
      {
        name: 'ambient',
        priority: 1,
        volume: 0.4,
        enabled: true,
        tracks: [],
        mixingMode: 'always',
        spatialProcessing: true,
      },
      {
        name: 'effects',
        priority: 2,
        volume: 0.7,
        enabled: true,
        tracks: [],
        mixingMode: 'triggered',
        spatialProcessing: true,
      },
      {
        name: 'dialogue',
        priority: 3,
        volume: 0.9,
        enabled: true,
        tracks: [],
        mixingMode: 'ducking',
        spatialProcessing: false,
      },
      {
        name: 'music',
        priority: 4,
        volume: 0.5,
        enabled: true,
        tracks: [],
        mixingMode: 'adaptive',
        spatialProcessing: false,
      },
      {
        name: 'ui',
        priority: 5,
        volume: 0.8,
        enabled: true,
        tracks: [],
        mixingMode: 'triggered',
        spatialProcessing: false,
      },
    ];

    layers.forEach(layer => {
      this.audioLayers.set(layer.name, layer);
      this.volumeLevels.set(layer.name, layer.volume);
    });
  }

  // Initialize spatial audio (Web Audio API)
  private async initializeSpatialAudio(): Promise<void> {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 48000,
          latencyHint: 'interactive',
        });
        console.log('Spatial audio initialized');
      } catch (error) {
        console.warn('Spatial audio not supported:', error);
      }
    }
  }

  // Load essential audio assets for offline functionality
  private async loadEssentialAssets(): Promise<void> {
    const essentialAssets: AudioAsset[] = [
      // UI Sounds
      {
        id: 'ui-click',
        name: 'Button Click',
        category: 'ui',
        type: 'sample',
        url: `${this.config.cdnBaseUrl}/ui/click.mp3`,
        format: 'mp3',
        quality: 128,
      },
      {
        id: 'ui-success',
        name: 'Success Sound',
        category: 'ui',
        type: 'sample',
        url: `${this.config.cdnBaseUrl}/ui/success.mp3`,
        format: 'mp3',
        quality: 128,
      },
      {
        id: 'ui-error',
        name: 'Error Sound',
        category: 'ui',
        type: 'sample',
        url: `${this.config.cdnBaseUrl}/ui/error.mp3`,
        format: 'mp3',
        quality: 128,
      },
      // Voice command feedback
      {
        id: 'voice-listening',
        name: 'Listening Tone',
        category: 'ui',
        type: 'sample',
        url: `${this.config.cdnBaseUrl}/voice/listening.mp3`,
        format: 'mp3',
        quality: 128,
      },
      // Basic ambient for offline mode
      {
        id: 'ambient-silence',
        name: 'Subtle Room Tone',
        category: 'ambient',
        type: 'loop',
        url: `${this.config.cdnBaseUrl}/ambient/room-tone.mp3`,
        format: 'mp3',
        quality: 64,
      },
    ];

    for (const asset of essentialAssets) {
      await this.preloadAsset(asset);
    }
  }

  // Preload an audio asset
  async preloadAsset(asset: AudioAsset): Promise<void> {
    try {
      if (asset.category === 'ui' || asset.category === 'effects') {
        // Load as Sound object for immediate playback
        const sound = new Sound(asset.url, '', (error) => {
          if (error) {
            console.error(`Failed to load sound ${asset.id}:`, error);
            this.onAudioError?.(error.message);
            return;
          }
          
          this.loadedSounds.set(asset.id, sound);
          this.onAudioLoad?.(asset.id);
          console.log(`Loaded sound: ${asset.name}`);
        });
      } else {
        // Add to TrackPlayer queue for streaming
        const track: Track = {
          id: asset.id,
          url: asset.url,
          title: asset.name,
          artist: 'AudioVR',
          duration: asset.duration,
        };
        
        await TrackPlayer.add([track]);
        this.onAudioLoad?.(asset.id);
        console.log(`Added track: ${asset.name}`);
      }
    } catch (error) {
      console.error(`Failed to preload asset ${asset.id}:`, error);
      this.onAudioError?.(error instanceof Error ? error.message : 'Asset load failed');
    }
  }

  // Play audio asset
  async playAudio(assetId: string, options: {
    loop?: boolean;
    volume?: number;
    spatial?: { x: number; y: number; z: number };
    fadeIn?: boolean;
    layer?: string;
  } = {}): Promise<void> {
    try {
      const sound = this.loadedSounds.get(assetId);
      
      if (sound) {
        // Play sound effect
        const volume = options.volume ?? 1.0;
        sound.setVolume(volume);
        
        if (options.loop) {
          sound.setNumberOfLoops(-1);
        }
        
        sound.play((success) => {
          if (!success) {
            console.error(`Failed to play sound: ${assetId}`);
          }
        });
      } else {
        // Play via TrackPlayer for music/dialogue
        const queue = await TrackPlayer.getQueue();
        const trackIndex = queue.findIndex(track => track.id === assetId);
        
        if (trackIndex >= 0) {
          await TrackPlayer.skip(trackIndex);
          await TrackPlayer.play();
          
          if (options.volume) {
            await TrackPlayer.setVolume(options.volume);
          }
        }
      }

      // Handle spatial positioning
      if (options.spatial && this.config.spatialAudio.enabled) {
        this.updateSpatialPosition(assetId, options.spatial);
      }

      // Update layer tracking
      if (options.layer) {
        this.currentTracks.set(options.layer, assetId);
      }
    } catch (error) {
      console.error(`Failed to play audio ${assetId}:`, error);
      this.onAudioError?.(error instanceof Error ? error.message : 'Audio playback failed');
    }
  }

  // Stop audio asset
  async stopAudio(assetId: string): Promise<void> {
    try {
      const sound = this.loadedSounds.get(assetId);
      
      if (sound) {
        sound.stop();
      } else {
        const state = await TrackPlayer.getState();
        if (state === State.Playing) {
          const currentTrack = await TrackPlayer.getCurrentTrack();
          if (currentTrack?.id === assetId) {
            await TrackPlayer.pause();
          }
        }
      }

      // Remove from spatial sources
      this.spatialSources.delete(assetId);
    } catch (error) {
      console.error(`Failed to stop audio ${assetId}:`, error);
    }
  }

  // Set layer volume
  async setLayerVolume(layerName: string, volume: number): Promise<void> {
    this.volumeLevels.set(layerName, Math.max(0, Math.min(1, volume)));
    
    const layer = this.audioLayers.get(layerName);
    if (layer) {
      layer.volume = volume;
      
      // Update volume for currently playing tracks in this layer
      const currentTrackId = this.currentTracks.get(layerName);
      if (currentTrackId) {
        await this.updateTrackVolume(currentTrackId, volume);
      }
    }
  }

  // Update track volume
  private async updateTrackVolume(assetId: string, volume: number): Promise<void> {
    const sound = this.loadedSounds.get(assetId);
    
    if (sound) {
      sound.setVolume(volume);
    } else {
      const currentTrack = await TrackPlayer.getCurrentTrack();
      if (currentTrack?.id === assetId) {
        await TrackPlayer.setVolume(volume);
      }
    }
  }

  // Update spatial audio position
  updateSpatialPosition(assetId: string, position: { x: number; y: number; z: number }): void {
    if (!this.audioContext || !this.config.spatialAudio.enabled) {
      return;
    }

    try {
      // Web Audio API spatial positioning
      let pannerNode = this.spatialSources.get(assetId);
      
      if (!pannerNode) {
        pannerNode = this.audioContext.createPanner();
        pannerNode.panningModel = 'HRTF';
        pannerNode.distanceModel = 'exponential';
        pannerNode.maxDistance = 50;
        pannerNode.rolloffFactor = 1.5;
        pannerNode.coneInnerAngle = 30;
        pannerNode.coneOuterAngle = 90;
        pannerNode.coneOuterGain = 0.3;
        
        this.spatialSources.set(assetId, pannerNode);
      }

      // Update position
      pannerNode.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
      pannerNode.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
      pannerNode.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
      
      console.log(`Updated spatial position for ${assetId}:`, position);
    } catch (error) {
      console.error('Failed to update spatial position:', error);
    }
  }

  // Update listener position and orientation
  updateListenerPosition(
    position: { x: number; y: number; z: number },
    orientation: { x: number; y: number; z: number }
  ): void {
    if (!this.audioContext || !this.config.spatialAudio.enabled) {
      return;
    }

    try {
      const listener = this.audioContext.listener;
      
      if (listener.positionX) {
        // Modern Web Audio API
        listener.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
        listener.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
        listener.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
        
        listener.forwardX.setValueAtTime(orientation.x, this.audioContext.currentTime);
        listener.forwardY.setValueAtTime(orientation.y, this.audioContext.currentTime);
        listener.forwardZ.setValueAtTime(orientation.z, this.audioContext.currentTime);
      } else {
        // Legacy Web Audio API
        listener.setPosition(position.x, position.y, position.z);
        listener.setOrientation(orientation.x, orientation.y, orientation.z, 0, 1, 0);
      }

      this.config.spatialAudio.listenerPosition = position;
      this.config.spatialAudio.listenerOrientation = orientation;
    } catch (error) {
      console.error('Failed to update listener position:', error);
    }
  }

  // Set environment type for reverb
  setEnvironmentType(environmentType: SpatialAudioConfig['environmentType']): void {
    this.config.spatialAudio.environmentType = environmentType;
    
    // Apply environment-specific reverb settings
    const reverbSettings = {
      train: { roomSize: 0.3, decay: 1.2, wet: 0.2 },
      mansion: { roomSize: 0.8, decay: 2.5, wet: 0.4 },
      outdoor: { roomSize: 1.0, decay: 0.8, wet: 0.1 },
      'small-room': { roomSize: 0.2, decay: 0.9, wet: 0.3 },
      'space-station': { roomSize: 0.6, decay: 1.8, wet: 0.5 },
    };

    const settings = reverbSettings[environmentType];
    if (settings && this.audioContext) {
      this.applyReverbSettings(settings);
    }
  }

  // Apply reverb settings
  private applyReverbSettings(settings: { roomSize: number; decay: number; wet: number }): void {
    // Implementation would depend on reverb library/Web Audio API convolution
    console.log('Applying reverb settings:', settings);
  }

  // Set up event listeners
  private setupEventListeners(): void {
    // TrackPlayer events
    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (data) => {
      console.log('Track changed:', data);
    });

    TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      console.log('Playback state changed:', data.state);
    });

    TrackPlayer.addEventListener(Event.PlaybackError, (data) => {
      console.error('Playback error:', data);
      this.onAudioError?.(data.message || 'Playback error occurred');
    });
  }

  // Set event callbacks
  setEventCallbacks({
    onAudioLoad,
    onAudioError,
    onCacheUpdate,
  }: {
    onAudioLoad?: (assetId: string) => void;
    onAudioError?: (error: string) => void;
    onCacheUpdate?: (progress: number) => void;
  }): void {
    this.onAudioLoad = onAudioLoad;
    this.onAudioError = onAudioError;
    this.onCacheUpdate = onCacheUpdate;
  }

  // Get current layer volumes
  getLayerVolumes(): Record<string, number> {
    const volumes: Record<string, number> = {};
    this.volumeLevels.forEach((volume, layerName) => {
      volumes[layerName] = volume;
    });
    return volumes;
  }

  // Enable/disable accessibility mode
  setAccessibilityMode(enabled: boolean): void {
    this.config.accessibilityMode = enabled;
    
    if (enabled) {
      // Enhance dialogue layer, reduce ambient/music
      this.setLayerVolume('dialogue', 1.0);
      this.setLayerVolume('ambient', 0.2);
      this.setLayerVolume('music', 0.3);
      this.setLayerVolume('ui', 1.0);
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      // Stop all sounds
      this.loadedSounds.forEach(sound => {
        sound.stop();
        sound.release();
      });
      this.loadedSounds.clear();
      
      // Stop TrackPlayer
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      
      // Close audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      this.isInitialized = false;
      console.log('AudioVR Service cleaned up');
    } catch (error) {
      console.error('Failed to cleanup audio service:', error);
    }
  }
}

export default AudioVRService;