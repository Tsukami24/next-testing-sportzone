import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 24,
}) => {
  const handleClick = (star: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          style={{
            fontSize: size,
            color: star <= rating ? '#FFD700' : '#ccc',
            cursor: readonly ? 'default' : 'pointer',
            marginRight: 2,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
