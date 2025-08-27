'use client';

import { useState, useEffect } from 'react';

export default function TestVideoToggle() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Videolar yüklenirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Videos load error:', error);
      setMessage({ type: 'error', text: 'Videolar yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoVisibility = async (videoId: string, currentStatus: 'visible' | 'hidden') => {
    try {
      const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
      const response = await fetch(`/api/admin/videos/${videoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Video ${newStatus === 'visible' ? 'görünür yapıldı' : 'gizlendi'}!` 
        });
        loadVideos();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Durum değiştirilirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Toggle visibility error:', error);
      setMessage({ type: 'error', text: 'Durum değiştirilirken hata oluştu.' });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Video Toggle Test</h1>
      {message && (
        <div style={{ padding: '10px', margin: '10px 0', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
          {message.text}
        </div>
      )}
      <div>
        {videos.map((video) => (
          <div key={video._id} style={{ display: 'flex', alignItems: 'center', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
            <img src={video.thumbnail} alt={video.title} style={{ width: '120px', height: '90px', objectFit: 'cover', marginRight: '10px' }} />
            <div style={{ flex: 1 }}>
              <h3>{video.title}</h3>
              <p>Status: {video.status}</p>
            </div>
            <button 
              onClick={() => toggleVideoVisibility(video._id, video.status)}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: video.status === 'visible' ? '#dc3545' : '#28a745',
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {video.status === 'visible' ? 'Gizle' : 'Göster'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}