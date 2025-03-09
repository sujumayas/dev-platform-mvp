import React, { useState } from 'react';

/**
 * Component for displaying Gherkin format
 */
const GherkinDisplay = ({ gherkin }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Format the Gherkin text with appropriate coloring
  const formatGherkin = (text) => {
    if (!text) return null;
    
    // Split text into lines
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Apply different styling based on line content
      let className = 'text-gray-800';
      
      if (line.trim().startsWith('Feature:')) {
        className = 'text-indigo-700 font-bold';
      } else if (line.trim().startsWith('Scenario:')) {
        className = 'text-blue-600 font-semibold';
      } else if (line.trim().startsWith('Given')) {
        className = 'text-green-600';
      } else if (line.trim().startsWith('When')) {
        className = 'text-orange-600';
      } else if (line.trim().startsWith('Then')) {
        className = 'text-purple-600';
      } else if (line.trim().startsWith('And')) {
        className = 'text-teal-600';
      }
      
      // Calculate indentation
      const indentLevel = line.match(/^\s*/)[0].length;
      const paddingLeft = indentLevel * 0.5; // 0.5rem per indent level
      
      return (
        <div 
          key={index} 
          className={`${className} whitespace-pre`}
          style={{ paddingLeft: `${paddingLeft}rem` }}
        >
          {line}
        </div>
      );
    });
  };
  
  // If no Gherkin text is provided
  if (!gherkin) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-lg font-medium mb-2">Gherkin Format</h3>
        <p className="text-gray-500 italic">No Gherkin format available yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          Transition the story to "Ready for Refinement" to generate Gherkin format.
        </p>
      </div>
    );
  }
  
  // Preview mode shows just the first few lines
  const lines = gherkin.split('\n');
  const previewLines = lines.slice(0, 3); // Show first 3 lines in preview
  const hasMoreLines = lines.length > 3;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Gherkin Format</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-x-auto max-h-60 overflow-y-auto">
        {expanded 
          ? formatGherkin(gherkin)
          : (
            <>
              {formatGherkin(previewLines.join('\n'))}
              {hasMoreLines && (
                <div className="text-gray-500 mt-1 border-t border-gray-200 pt-1">
                  <button
                    onClick={() => setExpanded(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm focus:outline-none"
                  >
                    + Show {lines.length - previewLines.length} more lines
                  </button>
                </div>
              )}
            </>
          )
        }
      </div>
    </div>
  );
};

export default GherkinDisplay;
