/**
 * Media utilities for handling device enumeration and media streams
 */

/**
 * Fetches all available media input/output devices
 * @returns {Promise<{audioInputs: MediaDeviceInfo[], videoInputs: MediaDeviceInfo[], audioOutputs: MediaDeviceInfo[]}>}
 */
export const enumerateDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
   

    return {
      audioInputs: devices.filter(device => device.kind === 'audioinput'),
      videoInputs: devices.filter(device => device.kind === 'videoinput'),
      audioOutputs: devices.filter(device => device.kind === 'audiooutput')
    };
  } catch (error) {
    console.error('Error enumerating devices:', error);
    throw error;
  }
};

/**
 * Get media stream based on constraints
 * @param {Object} constraints - Media constraints object
 * @returns {Promise<MediaStream>}
 */
export const getMediaStream = async (constraints = {
  audio: true,
  video: true
}) => {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Error getting media stream:', error);
    throw error;
  }
};

/**
 * Stop all tracks in a media stream
 * @param {MediaStream} stream - The media stream to stop
 */
export const stopMediaStream = (stream) => {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
};

/**
 * Create detailed video constraints
 * @param {string} deviceId - Selected video device ID
 * @param {Object} options - Additional video options
 * @returns {Object} Video constraints object
 */
export const createVideoConstraints = (deviceId, options = {}) => ({
  deviceId: deviceId ? { exact: deviceId } : undefined,
  width: options.width || { ideal: 1280 },
  height: options.height || { ideal: 720 },
  frameRate: options.frameRate || { ideal: 30 }
});

/**
 * Create detailed audio constraints
 * @param {string} deviceId - Selected audio device ID
 * @param {Object} options - Additional audio options
 * @returns {Object} Audio constraints object
 */
export const createAudioConstraints = (deviceId, options = {}) => ({
  deviceId: deviceId ? { exact: deviceId } : undefined,
  echoCancellation: options.echoCancellation ?? true,
  noiseSuppression: options.noiseSuppression ?? true,
  autoGainControl: options.autoGainControl ?? true
});

/**
 * Check if the browser supports specific media APIs
 * @returns {Object} Object containing support status for various features
 */
export const checkMediaSupport = () => ({
  getUserMedia: !!navigator.mediaDevices?.getUserMedia,
  screenSharing: !!navigator.mediaDevices?.getDisplayMedia,
  audioOutput: !!HTMLAudioElement.prototype.setSinkId,
  mediaRecorder: !!window.MediaRecorder
});

/**
 * Get screen sharing stream
 * @param {Object} options - Screen sharing options
 * @returns {Promise<MediaStream>}
 */
export const getScreenShareStream = async (options = {
  audio: false,
  video: true
}) => {
  try {
    return await navigator.mediaDevices.getDisplayMedia(options);
  } catch (error) {
    console.error('Error getting screen share stream:', error);
    throw error;
  }
};

/**
 * Creates a MediaRecorder instance with specified options
 * @param {MediaStream} stream - The stream to record
 * @param {Object} options - Recording options
 * @returns {MediaRecorder} MediaRecorder instance
 */
export const createRecorder = (stream, options = {
  mimeType: 'video/webm;codecs=vp9,opus'
}) => {
  // Check if the specified MIME type is supported
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    // Fallback to basic webm
    options.mimeType = 'video/webm';
  }
  
  return new MediaRecorder(stream, options);
};

/**
 * Starts recording a stream and returns the recorded data
 * @param {MediaRecorder} recorder - The MediaRecorder instance
 * @returns {Promise<Blob>} Promise that resolves with the recorded data
 */
export const startRecording = (recorder) => {
  return new Promise((resolve) => {
    const chunks = [];
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: chunks[0].type });
      resolve(blob);
    };

    recorder.start();
  });
};

/**
 * Initialize IndexedDB for storing recordings
 * @returns {Promise<IDBDatabase>}
 */
export const initializeRecordingsDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RecordingsDB', 1);

    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings', { 
          keyPath: 'id',
          autoIncrement: true 
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Save recording to IndexedDB
 * @param {Blob} blob - The recorded data
 * @param {string} filename - Name of the recording
 * @returns {Promise<number>} Promise that resolves with the recording ID
 */
export const saveRecording = async (blob, filename) => {
  const db = await initializeRecordingsDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recordings'], 'readwrite');
    const store = transaction.objectStore('recordings');
    
    const recording = {
      filename,
      blob,
      timestamp: new Date().toISOString(),
      type: blob.type,
      size: blob.size
    };

    const request = store.add(recording);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get all recordings from IndexedDB
 * @returns {Promise<Array>} Promise that resolves with array of recordings
 */
export const getAllRecordings = async () => {
  const db = await initializeRecordingsDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recordings'], 'readonly');
    const store = transaction.objectStore('recordings');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Delete a recording from IndexedDB
 * @param {number} id - ID of the recording to delete
 * @returns {Promise<void>}
 */
export const deleteRecording = async (id) => {
  const db = await initializeRecordingsDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recordings'], 'readwrite');
    const store = transaction.objectStore('recordings');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Modify the existing downloadRecording function to optionally save to IndexedDB first
export const downloadRecording = async (blob, filename, saveToIndexedDB = true) => {
  if (saveToIndexedDB) {
    try {
      await saveRecording(blob, filename);
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}; 