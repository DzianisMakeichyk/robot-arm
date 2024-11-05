interface StatusDisplayProps {
  connectionStatus: string;
  motorStatus: {[key: string]: string};
  onTestMotor: () => void;
}

export const StatusDisplay = ({ connectionStatus, motorStatus, onTestMotor }: StatusDisplayProps) => {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{
        padding: '5px',
        background: connectionStatus === 'connected' ? '#4CAF50' : '#f44336',
        color: 'white',
        borderRadius: '4px'
      }}>
        Socket Status: {connectionStatus}
      </div>
      <button
        onClick={onTestMotor}
        style={{
          padding: '10px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Motor
      </button>
      <div style={{
        padding: '5px',
        background: '#333',
        color: 'white',
        borderRadius: '4px'
      }}>
        Motors: 
        <br />
        Base: {motorStatus.base}
        <br />
        Elbow: {motorStatus.elbow}
        <br />
        Height: {motorStatus.height}
      </div>
    </div>
  );
};