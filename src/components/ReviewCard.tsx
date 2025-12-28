import React from "react";
import { motion } from "framer-motion";
import type { InferEntrySchema } from "astro:content";

interface ReviewCardProps {
  review: { data: InferEntrySchema<"review">; body: string };
  scale?: number;
  blur?: number;
  opacity?: number;
  zIndex?: number;
  x?: number;
  y?: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  scale = 1,
  blur = 0,
  opacity = 1,
  zIndex = 10,
  x = 0,
  y = 0,
}) => {
  return (
    <motion.a
      href={review.data.linkedinUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="tw-absolute tw-transition-transform tw-duration-300 hover:tw-scale-[1.03]"
      style={{
        top: `${y}px`,
        left: `${x}%`,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        opacity,
        zIndex,
      }}
    >
      <div className="tw-flex tw-items-center tw-gap-4 tw-bg-neutral-900 tw-backdrop-blur-xl tw-border tw-border-white/30 tw-rounded-2xl tw-shadow-lg tw-px-5 tw-py-4 tw-w-[20rem]">
        <div className="tw-w-14 tw-h-14 tw-flex-shrink-0">
          <img
            src={review.data.imageUrl}
            alt={review.data.name}
            className="tw-w-full tw-h-full tw-rounded-full tw-object-cover tw-border tw-border-white/50 tw-bg-white/10"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/reviews/default-avatar.jpg")}
          />
        </div>
        <div className="tw-flex tw-flex-col tw-overflow-hidden tw-max-w-[13rem]">
          <span className="tw-text-white tw-font-semibold tw-tracking-wide tw-text-base">
            {review.data.name}
          </span>
          <p className="tw-text-white/80 tw-text-sm tw-leading-snug tw-mt-1 tw-line-clamp-3">
            {review.body}
          </p>
        </div>
      </div>
    </motion.a>
  );
};
