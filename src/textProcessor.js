import React from 'react';
import { Tooltip } from '../components/Tooltip';
import { tooltipDefinitions } from '../data/tooltipDefinitions';

export const processTextWithTooltips = (text) => {
  if (!text) return '';
  
  // Convert the text into an array of terms to process
  const terms = Object.keys(tooltipDefinitions)
    .sort((a, b) => b.length - a.length); // Process longer terms first
    
  let result = [];
  let currentText = text;
  let lastIndex = 0;
  
  terms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    let match;
    
    while ((match = regex.exec(currentText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        result.push(currentText.slice(lastIndex, match.index));
      }
      
      // Add the tooltip component
      result.push(
        <Tooltip 
          key={`${term}-${match.index}`}
          text={term}
          tooltip={tooltipDefinitions[term]}
        />
      );
      
      lastIndex = match.index + term.length;
    }
  });
  
  // Add any remaining text
  if (lastIndex < currentText.length) {
    result.push(currentText.slice(lastIndex));
  }
  
  return result;
};
