import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaPaperPlane, FaUpload, FaTimes } from "react-icons/fa";
import type { InferEntrySchema } from "astro:content";
import ReviewForm from "./ReviewForm";
import { ReviewCard } from "./ReviewCard";

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
const reviewHeights = { front: 150, middle: 120, back: 100 };
const minGapY = 10;
const containerPadding = 10;

const generateNonOverlappingY = (
  existing: { top: number; height: number }[],
  depth: "front" | "middle" | "back",
  containerHeight: number
) => {
  const cardHeight = reviewHeights[depth];
  let y = getRandomBetween(containerPadding, containerHeight - cardHeight - containerPadding);
  let attempts = 0;
  while (
    existing.some(
      (r) => !(y + cardHeight + minGapY <= r.top || y >= r.top + r.height + minGapY)
    ) &&
    attempts < 200
  ) {
    y = getRandomBetween(containerPadding, containerHeight - cardHeight - containerPadding);
    attempts++;
  }
  return y;
};

export const ReviewsFlow: React.FC<ReviewsFlowProps> = ({ reviews }) => {
  const [items, setItems] = useState<MovingReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number>(window.innerHeight);

  const speed = 0.08;

  useEffect(() => {
    const handleResize = () => setContainerHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const positions: { top: number; height: number }[] = [];
    let baseReviews = reviews;
    if (reviews.length > 15) {
      baseReviews = reviews.slice(0, 15);
    } else if (reviews.length < 4) {
      baseReviews = [...reviews, ...reviews.slice(0, 4 - reviews.length)];
    }

    const init = baseReviews.map((r, i) => {
      const depth = getRandomDepth();
      const y = generateNonOverlappingY(positions, depth, containerHeight);
      positions.push({ top: y, height: reviewHeights[depth] });
      return { id: `${r.data.name}-${i}`, x: getRandomBetween(-30, 100), y, depth, review: r };
    });
    setItems(init);
  }, [reviews, containerHeight]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        // Creamos una copia profunda para mutar las posiciones secuencialmente
        const nextItems = prev.map((item) => ({ ...item }));

        for (let i = 0; i < nextItems.length; i++) {
          const item = nextItems[i];
          item.x += speed;

          // Cuando sale por la derecha → recalcular Y y profundidad
          if (item.x > 110) {
            item.depth = getRandomDepth();
            item.x = getRandomBetween(-40, -20);

            // Importante: Usar nextItems (que contiene las actualizaciones de esta iteración)
            // para verificar colisiones. Así evitamos que dos items elijan el mismo hueco
            // en el mismo tick.
            const otherItems = nextItems.filter((_, idx) => idx !== i);

            item.y = generateNonOverlappingY(
              otherItems.map((p) => ({
                top: p.y,
                height: reviewHeights[p.depth],
              })),
              item.depth,
              containerHeight
            );
          }
        }

        return nextItems;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [containerHeight]);



  const depthStyles = {
    front: { scale: 1, blur: 0, opacity: 1, zIndex: 30 },
    middle: { scale: 0.85, blur: 0.75, opacity: 0.9, zIndex: 20 },
    back: { scale: 0.7, blur: 1, opacity: 0.6, zIndex: 10 },
  };

  return (
    <div className="tw-relative tw-w-full tw-h-screen tw-flex tw-flex-col tw-items-center tw-justify-between">
      {/* Título */}
      <h2 className="tw-text-4xl tw-font-medium tw-text-gray-200 tw-text-center tw-mt-12">
        Reviews
      </h2>

      {/* Fondo animado con reviews flotantes */}
      <div
        className={`tw-relative tw-w-full tw-flex-1 tw-overflow-hidden tw-transition-all tw-duration-700 ${showForm ? "tw-blur-md tw-opacity-50" : "tw-blur-0 tw-opacity-100"
          }`}
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
        }}
      >
        {items.map((item) => {
          const d = depthStyles[item.depth];
          return (
            <ReviewCard
              key={item.id}
              review={item.review}
              scale={d.scale}
              blur={d.blur}
              opacity={d.opacity}
              zIndex={d.zIndex}
              x={item.x}
              y={item.y}
            />
          );
        })}
      </div>

      {/* Botones inferiores */}

      <div className="tw-absolute tw-bottom-8 tw-flex tw-gap-6 tw-justify-center tw-w-full tw-z-50">
        <button
          onClick={() => setShowForm(true)}
          className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 
                    tw-bg-[#5227FF] hover:tw-bg-[#6a44ff] tw-text-white 
                    tw-font-semibold tw-rounded-full tw-px-8 tw-py-4 
                    tw-transition-colors tw-shadow-lg tw-shadow-[#5227FF]/60"
        >
          <FaPaperPlane className="tw-w-5 tw-h-5 tw-animate-pulse" />
          <span>Leave a Review</span>
        </button>


        <a
          href="/reviews"
          className=" tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-[#5227FF] hover:tw-bg-[#6a44ff] tw-text-white 
          tw-font-semibold  tw-rounded-full tw-px-8 tw-py-4 tw-transition-colors tw-shadow-lg tw-shadow-[#5227FF]/60"
        >
          All the Reviews
        </a>
      </div>

      {/* Modal del formulario */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="tw-fixed tw-inset-0 tw-bg-black/50 tw-z-40"
              onClick={() => setShowForm(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <ReviewForm onClose={() => setShowForm(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
