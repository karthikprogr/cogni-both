import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";

/**
 * Custom hook for managing dataset switching functionality
 * Provides methods to fetch available datasets and switch between them
 */
export function useDatasetSwitcher() {
  const [datasets, setDatasets] = useState([]);
  const [activeDataset, setActiveDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  
  // Refs to track component mount state and prevent memory leaks
  const isMountedRef = useRef(true);
  const retryTimeoutRef = useRef(null);
  const previousActiveDatasetRef = useRef(null);

  // Cache duration in milliseconds (30 seconds as per design)
  const CACHE_DURATION = 30 * 1000;
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY_BASE = 1000; // Base delay for exponential backoff

  /**
   * Enhanced error classification and handling
   */
  const classifyError = (error) => {
    if (!error) return null;

    const isNetworkError = !error.response || error.code === 'NETWORK_ERROR';
    const statusCode = error.response?.status;
    
    return {
      type: isNetworkError ? 'network' : 'api',
      message: error.response?.data?.error || error.message || 'Unknown error',
      statusCode,
      isRetryable: isNetworkError || statusCode === 429 || statusCode >= 500,
      userFriendlyMessage: getUserFriendlyErrorMessage(error, isNetworkError, statusCode)
    };
  };

  const getUserFriendlyErrorMessage = (error, isNetworkError, statusCode) => {
    if (isNetworkError) {
      return 'Unable to connect to server. Please check your internet connection.';
    }

    switch (statusCode) {
      case 404:
        return 'Dataset not found. It may have been deleted.';
      case 403:
        return 'You do not have permission to access this dataset.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
        return 'Server error. Please try again in a few moments.';
      default:
        return error.response?.data?.error || error.message || 'An unexpected error occurred.';
    }
  };

  /**
   * Auto-retry with exponential backoff
   */
  const scheduleRetry = useCallback((operation, attempt = 0) => {
    if (attempt >= MAX_RETRY_ATTEMPTS) return;

    const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        operation(attempt + 1);
      }
    }, delay);
  }, []);

  /**
   * Clear all error states and timeouts
   */
  const clearError = useCallback(() => {
    setError(null);
    setNetworkError(false);
    setRetryCount(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  /**
   * Enhanced fetch with retry logic and better error handling
   */
  const fetchDatasets = useCallback(async (forceRefresh = false, retryAttempt = 0) => {
    // Check if component is still mounted
    if (!isMountedRef.current) return;

    // Check if we have cached data and it's still valid
    if (!forceRefresh && lastFetch && Date.now() - lastFetch < CACHE_DURATION && retryAttempt === 0) {
      return;
    }

    setLoading(true);
    if (retryAttempt === 0) {
      clearError();
    }

    try {
      const response = await api.get("/data/datasets");
      const data = response.data;
      
      if (!isMountedRef.current) return; // Component unmounted during request

      if (data && Array.isArray(data.datasets)) {
        setDatasets(data.datasets);
        
        // Find and set the active dataset
        const active = data.datasets.find(d => d.is_active);
        if (active) {
          setActiveDataset(active);
        }
        
        setLastFetch(Date.now());
        setRetryCount(0);
        setNetworkError(false);
      } else {
        setDatasets([]);
        setActiveDataset(null);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error("Failed to fetch datasets:", err);
      const errorInfo = classifyError(err);
      
      setError(errorInfo);
      setNetworkError(errorInfo.type === 'network');
      setRetryCount(retryAttempt);
      
      // Auto-retry for retryable errors
      if (errorInfo.isRetryable && retryAttempt < MAX_RETRY_ATTEMPTS) {
        scheduleRetry((attempt) => fetchDatasets(forceRefresh, attempt), retryAttempt);
      } else {
        setDatasets([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [lastFetch, clearError, classifyError, scheduleRetry]);

  /**
   * Enhanced dataset switching with recovery mechanisms
   */
  const switchDataset = useCallback(async (datasetName) => {
    if (!datasetName) {
      setError({
        type: 'validation',
        message: 'Dataset name is required',
        userFriendlyMessage: 'Please select a valid dataset.',
        isRetryable: false
      });
      return false;
    }

    if (switching) {
      return false; // Prevent concurrent switches
    }

    if (!isMountedRef.current) return false;

    // Store previous active dataset for rollback
    previousActiveDatasetRef.current = activeDataset;
    
    setSwitching(true);
    clearError();

    try {
      // Call the switch API endpoint
      const response = await api.post(`/data/datasets/switch?name=${encodeURIComponent(datasetName)}`);
      
      if (!isMountedRef.current) return false;
      
      if (response.data && response.data.success) {
        // Update active dataset in local state
        const newActiveDataset = datasets.find(d => d.name === datasetName);
        if (newActiveDataset) {
          setActiveDataset(newActiveDataset);
          
          // Update datasets list to reflect new active status
          setDatasets(prevDatasets => 
            prevDatasets.map(d => ({
              ...d,
              is_active: d.name === datasetName
            }))
          );
        }
        
        // Clear cache to force refresh on next fetch
        setLastFetch(null);
        
        return true;
      } else {
        throw new Error(response.data?.error || "Dataset switch failed");
      }
    } catch (err) {
      if (!isMountedRef.current) return false;

      console.error("Failed to switch dataset:", err);
      const errorInfo = classifyError(err);
      setError(errorInfo);

      // Rollback to previous dataset on failure
      if (previousActiveDatasetRef.current) {
        setActiveDataset(previousActiveDatasetRef.current);
        
        // Restore previous active status in datasets list
        setDatasets(prevDatasets => 
          prevDatasets.map(d => ({
            ...d,
            is_active: d.name === previousActiveDatasetRef.current?.name
          }))
        );
      }
      
      return false;
    } finally {
      if (isMountedRef.current) {
        setSwitching(false);
      }
    }
  }, [datasets, switching, activeDataset, clearError, classifyError]);

  /**
   * Enhanced getCurrentDatasetInfo with error handling
   */
  const getCurrentDatasetInfo = useCallback(async () => {
    try {
      const response = await api.get("/data/info");
      return response.data;
    } catch (err) {
      console.error("Failed to get current dataset info:", err);
      const errorInfo = classifyError(err);
      setError(errorInfo);
      return null;
    }
  }, [classifyError]);

  /**
   * Enhanced refresh with better error recovery
   */
  const refresh = useCallback(() => {
    clearError();
    setLastFetch(null); // Clear cache
    fetchDatasets(true);
  }, [fetchDatasets, clearError]);

  /**
   * Enhanced retry with smart recovery
   */
  const retry = useCallback(() => {
    if (error) {
      clearError();
      
      if (error.type === 'network' || error.isRetryable) {
        fetchDatasets(true);
      } else {
        // For non-retryable errors, just clear the error
        setError(null);
      }
    }
  }, [error, fetchDatasets, clearError]);

  /**
   * Cleanup function to prevent memory leaks
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  // Auto-refresh when switching completes
  useEffect(() => {
    if (!switching && activeDataset && isMountedRef.current) {
      // Small delay to ensure backend has processed the switch
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          fetchDatasets(true);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [switching, activeDataset, fetchDatasets]);

  return {
    // Data
    datasets,
    activeDataset,
    
    // Loading states
    loading,
    switching,
    
    // Enhanced error handling
    error,
    networkError,
    retryCount,
    retry,
    clearError,
    
    // Actions
    fetchDatasets,
    switchDataset,
    getCurrentDatasetInfo,
    refresh,
    
    // Enhanced utilities
    isReady: !loading && !error,
    hasDatasets: datasets.length > 0,
    isRetrying: retryCount > 0,
    canRetry: error?.isRetryable || false,
  };
}