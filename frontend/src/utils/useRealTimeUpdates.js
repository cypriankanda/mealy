import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export const useRealTimeUpdates = (fetchFunction, dependencies = [], interval = 30000) => {
  const { refreshTrigger } = useAuth()
  const intervalRef = useRef(null)
  const isInitialized = useRef(false)

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      fetchFunction()
    }, interval)
  }, [fetchFunction, interval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchFunction()
    isInitialized.current = true

    // Start polling
    startPolling()

    // Cleanup on unmount
    return () => {
      stopPolling()
    }
  }, [fetchFunction, startPolling, stopPolling, refreshTrigger, ...dependencies])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchFunction()
  }, [fetchFunction])

  return { refresh, stopPolling, startPolling }
}

export const useManualRefresh = (fetchFunction, dependencies = []) => {
  const { refreshTrigger } = useAuth()

  useEffect(() => {
    fetchFunction()
  }, [fetchFunction, refreshTrigger, ...dependencies])

  const refresh = useCallback(() => {
    fetchFunction()
  }, [fetchFunction])

  return { refresh }
} 