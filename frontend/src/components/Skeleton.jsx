import React from 'react';
import './Skeleton.css';

// Mentor Card Skeleton
export const MentorSkeleton = () => {
  return (
    <div className="mentor-card skeleton-card">
      <div className="skeleton skeleton-avatar"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-heading"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-heading"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  );
};

// Booking Card Skeleton
export const BookingSkeleton = () => {
  return (
    <div className="booking-card skeleton-booking">
      <div className="skeleton skeleton-booking-title"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  );
};