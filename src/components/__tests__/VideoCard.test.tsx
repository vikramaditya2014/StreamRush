import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VideoCard from '../VideoCard';
import { Video } from '../../types';

const mockVideo: Video = {
  id: '1',
  title: 'Test Video',
  description: 'This is a test video',
  videoUrl: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  duration: 120,
  views: 1000,
  likes: 50,
  dislikes: 5,
  uploaderId: 'user1',
  uploaderName: 'Test User',
  uploaderAvatar: 'https://example.com/avatar.jpg',
  tags: ['test', 'video'],
  category: 'General',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const renderVideoCard = (video: Video = mockVideo) => {
  return render(
    <BrowserRouter>
      <VideoCard video={video} />
    </BrowserRouter>
  );
};

describe('VideoCard', () => {
  it('renders video title', () => {
    renderVideoCard();
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('renders uploader name', () => {
    renderVideoCard();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders view count', () => {
    renderVideoCard();
    expect(screen.getByText('1.0K views')).toBeInTheDocument();
  });

  it('renders duration when provided', () => {
    renderVideoCard();
    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('renders thumbnail image', () => {
    renderVideoCard();
    const thumbnail = screen.getByAltText('Test Video');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
  });

  it('links to video watch page', () => {
    renderVideoCard();
    const videoLinks = screen.getAllByRole('link', { name: /test video/i });
    expect(videoLinks[0]).toHaveAttribute('href', '/watch/1');
  });

  it('links to channel page', () => {
    renderVideoCard();
    const channelLinks = screen.getAllByRole('link', { name: /test user/i });
    expect(channelLinks[0]).toHaveAttribute('href', '/channel/user1');
  });
});