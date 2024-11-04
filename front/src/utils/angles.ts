export const normalizeRotation = (rotation: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, rotation));
}

export const degreesToNormalizedRotation = (degrees: number) => {
  // Convert degrees (-70 to 70) to rotation range (0 to 0.4)
  const normalizedDegrees = normalizeRotation(degrees, -70, 70);
  return (normalizedDegrees + 70) * (0.4 / 140); 
}

export const rotationToDegrees = (rotation: number) => {
  // Convert rotation (0 to 0.4) to degrees range (-70 to 70) 
  const normalizedRotation = normalizeRotation(rotation, 0, 0.4);
  return (normalizedRotation * (140 / 0.4)) - 70;
}

export const preserveRotationState = (prevRotation: number, newRotation: number) => {
  // Keep track of full rotations
  const fullRotations = Math.floor(prevRotation / (Math.PI * 2));
  return newRotation + (fullRotations * Math.PI * 2);
}