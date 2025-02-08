import DeviceSelect from './DeviceSelect';

const Controls = ({ 
  devices, 
  selectedDevices, 
  onDeviceChange, 
  onStreamToggle, 
  hasStream,
  isRecording,
  onStartRecording,
  onStopRecording 
}) => {




  return (
    <div className="controls-container">
      <DeviceSelect 
        devices={devices}
        selectedDevices={selectedDevices}
        onDeviceChange={onDeviceChange}
      />
      <div className="buttons-container">
        <button onClick={onStreamToggle}>
          {hasStream ? 'Restart Stream' : 'Start Stream'}
        </button>
        {hasStream && (
          <button 
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={isRecording ? 'recording' : ''}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Controls; 