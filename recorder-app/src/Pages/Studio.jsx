import { useEffect, useState, useRef } from 'react';
import {
  enumerateDevices,
  getMediaStream,
  stopMediaStream,
  createVideoConstraints,
  createAudioConstraints,
  createRecorder,
  startRecording,
  saveRecording,
  downloadRecording,
  getAllRecordings
} from '../utils/mediaUtils';
import VideoPreview from '../components/VideoPreview';


import Controls from '../components/Controls';

const Studio = () => {
  const videoRef = useRef(null);
  const [devices, setDevices] = useState({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: []
  });
  const [stream, setStream] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: '',
    videoInput: '',
    audioOutput: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);

  useEffect(() => {
    const loadDevices = async () => {
      const availableDevices = await enumerateDevices();
      setDevices(availableDevices);
      
      setSelectedDevices({
        audioInput: availableDevices.audioInputs[0]?.deviceId || '',
        videoInput: availableDevices.videoInputs[0]?.deviceId || '',
        audioOutput: availableDevices.audioOutputs[0]?.deviceId || ''
      });
    };
    
    loadDevices();
    return () => {
        console.log('Unmounting this is hte stream:', stream);
      if (stream) {
        stopMediaStream(stream);
        console.log('Stream stopped');
      }
    };
  }, []);

  const startStream = async () => {
    try {
      if (stream) {
        stopMediaStream(stream);
      }

      const mediaStream = await getMediaStream({
        video: createVideoConstraints(selectedDevices.videoInput),
        audio: createAudioConstraints(selectedDevices.audioInput)
      });
      console.log('Media stream:', mediaStream);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      if (videoRef.current?.setSinkId && selectedDevices.audioOutput) {
        try {
          await videoRef.current.setSinkId(selectedDevices.audioOutput);
        } catch (error) {
          console.error('Error setting audio output device:', error);
        }
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const handleDeviceChange = async (event, deviceType) => {
    const deviceId = event.target.value;
    setSelectedDevices(prev => ({
      ...prev,
      [deviceType]: deviceId
    }));
  };

  useEffect(() => {
    if (stream && (selectedDevices.audioInput || selectedDevices.videoInput)) {
      startStream();
    }
  }, [selectedDevices.audioInput, selectedDevices.videoInput]);

  const handleStartRecording = async () => {
    if (!stream) return;

    try {
      const mediaRecorder = createRecorder(stream);
      setRecorder(mediaRecorder);
      setIsRecording(true);
      
      const recordedData = await startRecording(mediaRecorder);
      
      // When recording stops, download the file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await saveRecording(recordedData, `recording-${timestamp}.webm`);
      const recordings = await getAllRecordings();
      console.log('Recordings:', recordings);
      // downloadRecording(recordedData, `recording-${timestamp}.webm`);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setIsRecording(false);
    }
  };

  // Clean up recorder when component unmounts
  useEffect(() => {
    return () => {
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    };
  }, [recorder]);

  return (
    <div className="studio-container">
      <VideoPreview ref={videoRef} />
      <Controls 
        devices={devices}
        selectedDevices={selectedDevices}
        onDeviceChange={handleDeviceChange}
        onStreamToggle={startStream}
        hasStream={!!stream}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
      />
    </div>
  );
};

export default Studio;
