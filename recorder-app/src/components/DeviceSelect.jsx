const DeviceSelect = ({ devices, selectedDevices, onDeviceChange }) => {
  return (
    <div className="device-select">
      <label>
        Camera:
        <select 
          value={selectedDevices.videoInput}
          onChange={(e) => onDeviceChange(e, 'videoInput')}
        >
          {devices.videoInputs.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
            </option>
          ))}
        </select>
      </label>

      <label>
        Microphone:
        <select 
          value={selectedDevices.audioInput}
          onChange={(e) => onDeviceChange(e, 'audioInput')}
        >
          {devices.audioInputs.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
            </option>
          ))}
        </select>
      </label>

      <label>
        Speakers:
        <select 
          value={selectedDevices.audioOutput}
          onChange={(e) => onDeviceChange(e, 'audioOutput')}
        >
          {devices.audioOutputs.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default DeviceSelect; 