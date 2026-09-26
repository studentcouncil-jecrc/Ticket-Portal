function Loader() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="12" height="12">
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        fill="none" 
        stroke="#3498db" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeDasharray="200" 
        strokeDashoffset="100">
        <animateTransform 
          attributeName="transform" 
          type="rotate" 
          from="0 50 50" 
          to="360 50 50" 
          dur="1s" 
          repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export default Loader
