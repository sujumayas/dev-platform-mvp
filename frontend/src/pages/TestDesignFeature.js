import React, { useState } from 'react';
import Layout from '../components/Layout';
import DesignUpload from '../components/stories/DesignUpload';
import Notification from '../components/Notification';
import storyService from '../services/storyService';

/**
 * Test page for the design upload and analysis feature
 */
const TestDesignFeature = () => {
  const [designUrl, setDesignUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [logs, setLogs] = useState([]);
  
  // Custom logging function
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, `${timestamp}: ${message}`]);
    console.log(message);
  };
  
  // Handle design URL update
  const handleDesignUpload = async (url) => {
    setDesignUrl(url);
    addLog(`Design URL set to: ${url}`);
    setNotification({
      type: 'success',
      message: 'Design URL saved successfully!'
    });
  };
  
  // Handle design analysis
  const handleAnalyzeDesign = async () => {
    if (!designUrl) {
      setNotification({
        type: 'error',
        message: 'Please enter a design URL first'
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      // First, create a temporary story with the design URL
      addLog('Creating temporary story for design analysis');
      addLog(`Using design URL: ${designUrl}`);
      
      // Build the story data
      const storyData = {
        title: 'Temporary Design Analysis',
        description: 'This is a temporary story created for design analysis.',
        design_url: designUrl
      };
      
      addLog(`Story data: ${JSON.stringify(storyData)}`);
      
      const tempStory = await storyService.createStory(storyData);
      
      addLog(`Temporary story created with ID: ${tempStory.id}`);
      addLog(`Story design_url: ${tempStory.design_url || 'null'}`);
      
      // If the design URL wasn't saved properly, update it
      if (!tempStory.design_url) {
        addLog('Design URL not saved in story creation, updating it now...');
        await storyService.updateStoryDesign(tempStory.id, designUrl);
        addLog('Design URL updated');
      }
      
      // Now analyze the design
      addLog('Calling API to analyze design using Claude');
      const response = await storyService.analyzeDesign(tempStory.id);
      addLog('Received analysis response from backend');
      
      if (response && response.generated_description) {
        addLog(`Generated description received (${response.generated_description.length} chars)`);
        setGeneratedDescription(response.generated_description);
        
        setNotification({
          type: 'success',
          message: 'Design analyzed successfully!'
        });
      } else {
        addLog('Warning: No generated description in response');
        setNotification({
          type: 'warning',
          message: 'Analysis completed but no description was generated.'
        });
      }
      
      // Delete the temporary story
      addLog('Cleaning up: Deleting temporary story');
      await storyService.deleteStory(tempStory.id);
      addLog('Temporary story deleted');
      addLog('Analysis process completed');
      
    } catch (error) {
      console.error('Design analysis error:', error);
      setNotification({
        type: 'error',
        message: `Failed to analyze design: ${error.response?.data?.detail || error.message || 'Unknown error'}`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Test Design Feature</h1>
        
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={clearNotification}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Design Upload & Analysis</h2>
            <DesignUpload
              designUrl={designUrl}
              onUpload={handleDesignUpload}
              onAnalyze={handleAnalyzeDesign}
              isAnalyzing={isAnalyzing}
            />
            
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2">How to Use This Feature</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Enter a valid image URL in the field above</li>
                <li>Click "Save Design URL" to store the URL</li>
                <li>Once the URL is saved, click "Generate Description" to analyze the design</li>
                <li>The generated description will appear in the panel on the right</li>
              </ol>
              <p className="mt-4 text-xs text-gray-500">
                Note: In production, the analysis would be performed by Claude AI via API call.
                This test page uses a mock response for demonstration purposes.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Generated Description</h2>
            <div className="bg-white border border-gray-200 rounded-md p-4 h-96 overflow-y-auto mb-6">
              {generatedDescription ? (
                <div className="whitespace-pre-wrap">{generatedDescription}</div>
              ) : (
                <div className="text-gray-400 italic">
                  No description generated yet. Upload a design and click "Generate Description" to see results here.
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-2">Process Logs</h2>
            <div className="bg-gray-800 text-green-400 font-mono text-sm p-4 rounded-md h-64 overflow-y-auto">
              {logs.length > 0 ? (
                <div>
                  {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">Log messages will appear here...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestDesignFeature;
