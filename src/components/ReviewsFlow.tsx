import React, { useEffect, useState } from "react"; 
import type { InferEntrySchema } from "astro:content";

interface ReviewsFlowProps {
  reviews: { data: InferEntrySchema<"review">; body: string }[];
}

interface MovingReview {
  id: string;
  x: number;
  y: number;
  depth: "front" | "middle" | "back";
  review: { data: InferEntrySchema<"review">; body: string };
}

const getRandomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const getRandomDepth = (): "front" | "middle" | "back" => {
  const r = Math.random();
  if (r < 0.5) return "front";
  if (r < 0.8) return "middle";
  return "back";
};

// Altura aproximada en px de cada card para cada profundidad
const reviewHeights = {
  front: 120,
  middle: 100,
  back: 80,
};

// Genera un Y que no se solape con otros existentes
const generateNonOverlappingY = (
  existing: { top: number; height: number }[],
  depth: "front" | "middle" | "back",
  containerHeight: number
) => {
  const cardHeight = reviewHeights[depth];
  let y = getRandomBetween(0, containerHeight - cardHeight);
  let attempts = 0;

  while (
    existing.some(
      (r) => !(y + cardHeight < r.top || y > r.top + r.height)
    ) &&
    attempts < 50
  ) {
    y = getRandomBetween(0, containerHeight - cardHeight);
    attempts++;
  }

  return y;
};

export const ReviewsFlow: React.FC<ReviewsFlowProps> = ({ reviews }) => {
  const [items, setItems] = useState<MovingReview[]>([]);
  const speed = 0.1; // velocidad constante
  const containerHeight = 640; // px, coincide con tw-h-[40rem]

  useEffect(() => {
    const positions: { top: number; height: number }[] = [];

    // Garantiza al menos 4 elementos simultáneos
    const baseReviews =
      reviews.length < 4 ? [...reviews, ...reviews.slice(0, 4 - reviews.length)] : reviews;

    const init = baseReviews.map((r, i) => {
      const depth = getRandomDepth();
      const y = generateNonOverlappingY(positions, depth, containerHeight);
      positions.push({ top: y, height: reviewHeights[depth] });
      return {
        id: `${r.data.name}-${i}`,
        x: getRandomBetween(-30, 100),
        y,
        depth,
        review: r,
      };
    });
    setItems(init);
  }, [reviews]);

  // Movimiento de izquierda a derecha
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          let newX = item.x + speed;
          if (newX > 110) {
            const depth = getRandomDepth();
            const newY = generateNonOverlappingY(
              prev.map((p) => ({ top: p.y, height: reviewHeights[p.depth] })),
              depth,
              containerHeight
            );
            return {
              ...item,
              x: getRandomBetween(-40, -20),
              y: newY,
              depth,
            };
          }
          return { ...item, x: newX };
        })
      );
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const depthStyles = {
    front: { scale: 1, blur: 0, opacity: 1, zIndex: 30 },
    middle: { scale: 0.85, blur: 1, opacity: 0.9, zIndex: 20 },
    back: { scale: 0.7, blur: 2, opacity: 0.6, zIndex: 10 },
  };

  return (
    <div>
      <h2 className="tw-text-4xl tw-font-medium tw-text-gray-200 max-md:tw-text-3xl tw-mb-16 tw-text-center">
        Reviews
      </h2>
      <div className="tw-relative tw-w-full tw-h-[40rem] tw-overflow-hidden tw-bg-transparent">
        {items.map((item) => {
          const d = depthStyles[item.depth];
          return (
            <a
              key={item.id}
              href={item.review.data.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tw-absolute tw-transition-transform tw-duration-300 tw-ease-out hover:tw-scale-[1.03]"
              style={{
                top: `${item.y}px`,
                left: `${item.x}%`,
                transform: `scale(${d.scale})`,
                filter: `blur(${d.blur}px)`,
                opacity: d.opacity,
                zIndex: d.zIndex,
              }}
            >
              <div className="tw-flex tw-items-center tw-gap-4 tw-bg-white/20 tw-backdrop-blur-xl tw-border tw-border-white/30 tw-rounded-2xl tw-shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] tw-px-5 tw-py-4 tw-w-[20rem] tw-text-left tw-transition-all tw-duration-300 hover:tw-bg-white/30 hover:tw-shadow-[0_8px_32px_0_rgba(31,38,135,0.3)]">
                <div className="tw-w-14 tw-h-14 tw-flex-shrink-0">
                  <img
                    src={`/reviews/${item.review.data.name}.jpg`}
                    alt={item.review.data.name}
                    className="tw-w-full tw-h-full tw-rounded-full tw-object-cover tw-border tw-border-white/50 tw-bg-white/10"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = "/reviews/default-avatar.jpg")}
                  />
                </div>
                <div className="tw-flex tw-flex-col tw-overflow-hidden tw-max-w-[13rem]">
                  <span className="tw-text-white tw-font-semibold tw-tracking-wide tw-text-base tw-drop-shadow-sm">
                    {item.review.data.name}
                  </span>
                  <p className="tw-text-white/80 tw-text-sm tw-leading-snug tw-mt-1 tw-line-clamp-3">
                    {item.review.body}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
