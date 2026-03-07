/**
 * useAcceptanceProbability Hook
 * 
 * Hook لجلب احتمالية القبول من API
 */

import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAcceptanceProbability = (jobId, options = {}) => {
  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { autoFetch = true } = options;

  useEffect(() => {
    if (autoFetch && jobId) {
      fetchProbability();
    }
  }, [jobId, autoFetch]);

  const fetchProbability = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const response = await fetch(`${API_URL}/acceptance-probability/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('فشل في جلب احتمالية القبول');
      }

      const data = await response.json();
      setProbability(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching acceptance probability:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    probability,
    loading,
    error,
    refetch: fetchProbability
  };
};

export const useBulkAcceptanceProbabilities = (jobIds, options = {}) => {
  const [probabilities, setProbabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { autoFetch = true } = options;

  useEffect(() => {
    if (autoFetch && jobIds && jobIds.length > 0) {
      fetchProbabilities();
    }
  }, [JSON.stringify(jobIds), autoFetch]);

  const fetchProbabilities = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const response = await fetch(`${API_URL}/acceptance-probability/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobIds })
      });

      if (!response.ok) {
        throw new Error('فشل في جلب احتمالية القبول');
      }

      const data = await response.json();
      setProbabilities(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bulk acceptance probabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    probabilities,
    loading,
    error,
    refetch: fetchProbabilities
  };
};

export const useAllJobsProbabilities = (options = {}) => {
  const [data, setData] = useState({ jobs: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { page = 1, limit = 20, autoFetch = true } = options;

  useEffect(() => {
    if (autoFetch) {
      fetchAllProbabilities();
    }
  }, [page, limit, autoFetch]);

  const fetchAllProbabilities = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const response = await fetch(
        `${API_URL}/acceptance-probability/all?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('فشل في جلب احتمالية القبول');
      }

      const result = await response.json();
      setData({
        jobs: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching all jobs probabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    jobs: data.jobs,
    pagination: data.pagination,
    loading,
    error,
    refetch: fetchAllProbabilities
  };
};
