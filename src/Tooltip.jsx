import React, { useState } from 'react';

export const Tooltip = ({ text, tooltip }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="relative inline-block mx-1"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="border-b-2 border-dotted border-blue-400 cursor-help">
        {text}
      </span>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-black text-white rounded px-4 py-2 text-sm whitespace-nowrap">
            {tooltip}
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black absolute left-1/2 transform -translate-x-1/2"></div>
        </div>
      )}
    </span>
  );
};
