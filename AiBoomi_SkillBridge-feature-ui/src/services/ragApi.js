// src/services/ragApi.js
import axios from 'axios';

// Backend URLs
const PYTHON_BACKEND_URL = 'http://localhost:8000';

// Create axios instance for Python backend
const ragApi = axios.create({
  baseURL: PYTHON_BACKEND_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug interceptors
ragApi.interceptors.request.use(
  (config) => {
    console.log(`🚀 Python API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Python API Request Error:', error);
    return Promise.reject(error);
  }
);

ragApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Python API Response: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Python API Error:', error.message);
    return Promise.reject(error);
  }
);

// API Methods
export const pythonRagAPI = {
  // Test if Python backend is running
  testConnection: async () => {
    try {
      const response = await axios.get(`${PYTHON_BACKEND_URL}/`, {
        timeout: 3000
      });
      return { 
        status: 'connected', 
        data: response.data,
        message: 'Python backend is connected'
      };
    } catch (error) {
      console.warn('⚠️ Python backend not reachable:', error.message);
      return { 
        status: 'disconnected', 
        error: 'Python backend is not running. Please start the AI server.',
        details: error.message
      };
    }
  },

  // Get health status
  getHealth: async () => {
    try {
      const response = await axios.get(`${PYTHON_BACKEND_URL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Test endpoint
  testEndpoint: async () => {
    try {
      const response = await axios.get(`${PYTHON_BACKEND_URL}/test`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error(`Test failed: ${error.message}`);
    }
  },

  // Get coach recommendations from Python RAG
  getRecommendations: async (requestId) => {
    try {
      console.log(`🤖 Requesting RAG recommendations for: ${requestId}`);
      
      const response = await ragApi.post('/recommend', {
        request_id: requestId
      }, {
        timeout: 60000
      });
      
      return response.data;
      
    } catch (error) {
      console.error('RAG API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return mock response if backend fails
      if (error.response?.status === 404) {
        throw new Error('Backend endpoint not found. Make sure the Python server is running correctly.');
      }
      
      throw new Error(`RAG recommendation failed: ${error.response?.data?.error || error.message}`);
    }
  }
};

export default pythonRagAPI;