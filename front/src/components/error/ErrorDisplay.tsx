interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#ff4444',
      color: 'white',
      padding: '20px',
      borderRadius: '5px',
      textAlign: 'center'
  }}>
      <div>{error}</div>
      <button 
          onClick={() => window.location.reload()}
          style={{
              marginTop: '10px',
              padding: '5px 15px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
          }}
      >
          Retry
      </button>
  </div>
  );
};