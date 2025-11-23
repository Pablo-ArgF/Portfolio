// components/ReviewCardStatic.tsx
import React from "react";
import { motion } from "framer-motion";
import type { InferEntrySchema } from "astro:content";

interface ReviewCardStaticProps {
  review: { data: InferEntrySchema<"review">; body: string };
}

export const ReviewCardStatic: React.FC<ReviewCardStaticProps> = ({ review }) => {
  const hasLinkedin = Boolean(review.data.linkedinUrl);

  const Wrapper: React.ElementType = hasLinkedin ? "a" : "div";
  const wrapperProps = hasLinkedin
    ? {
        href: review.data.linkedinUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "tw-block tw-cursor-pointer hover:tw-opacity-80 tw-transition tw-w-full",
      }
    : {
        className: "tw-block tw-w-full hover:tw-opacity-80 tw-transition",
      };

  return (
    <Wrapper {...wrapperProps}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="
          tw-flex tw-flex-col tw-gap-4
          tw-bg-white/20 tw-backdrop-blur-xl
          tw-border tw-border-white/30
          tw-rounded-2xl tw-shadow-lg
          tw-px-[clamp(1.1rem,3vw,1.3rem)] tw-py-[clamp(1.1rem,3vw,1.3rem)]
          tw-w-full
          tw-mx-auto
        "
      >
        {/* TOP SECTION: IMAGE + NAME */}
        <div className="tw-flex tw-items-center tw-gap-[clamp(0.5rem,3vw,1.5rem)]">
          <div
            className="
              tw-flex-shrink-0
              tw-w-[clamp(5em,4.5vw,6em)]
              tw-h-[clamp(5em,4.5vw,6em)]
            "
          >
            <img
              src={`reviews/${review.data.name}.jpg`}
              alt={review.data.name}
              className="
                tw-w-full tw-h-full tw-rounded-full tw-object-cover
                tw-border tw-border-white/50 tw-bg-white/10
              "
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/reviews/default-avatar.jpg")}
            />
          </div>

          <span
            className="
              tw-text-white tw-font-semibold tw-tracking-wide
              [font-size:clamp(1.1rem,1.3rem,1.7rem)]
            "
          >
            {review.data.name}
          </span>
        </div>

        {/* BODY TEXT */}
        <p
          className="
            tw-text-white/90
            [font-size:clamp(1rem,1.4rem,1.3rem)]
            tw-leading-relaxed tw-whitespace-pre-line
          "
        >
          {review.body}
        </p>
      </motion.div>
    </Wrapper>
  );
};
