// components/ReviewCardStatic.tsx
import React from "react";
import type { InferEntrySchema } from "astro:content";

interface ReviewCardStaticProps {
  review: { data: InferEntrySchema<"review">; body: string };
}

export const ReviewCardStatic: React.FC<ReviewCardStaticProps> = ({ review }) => (
  <div
    className="
      tw-flex tw-items-start tw-gap-3
      tw-bg-white/20 tw-backdrop-blur-xl
      tw-border tw-border-white/30
      tw-rounded-2xl tw-shadow-lg
      tw-px-4 tw-py-3

      tw-w-[20em]
      tw-mx-auto            
    "
  >
    <div className="tw-w-12 tw-h-12 tw-flex-shrink-0">
      <img
        src={`/reviews/${review.data.name}.jpg`}
        alt={review.data.name}
        className="
          tw-w-full tw-h-full tw-rounded-full tw-object-cover
          tw-border tw-border-white/50 tw-bg-white/10
        "
        loading="lazy"
        onError={(e) => (e.currentTarget.src = '/reviews/default-avatar.jpg')}
      />
    </div>

    <div className="tw-flex tw-flex-col tw-overflow-hidden">
      <span className="tw-text-white tw-font-semibold tw-tracking-wide tw-text-base">
        {review.data.name}
      </span>

      <p className="
        tw-text-white/80
        tw-text-sm sm:tw-text-base
        tw-leading-snug tw-mt-1
        
      ">
        {review.body}
      </p>
    </div>
  </div>
);
