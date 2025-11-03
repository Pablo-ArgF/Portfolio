import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaPaperPlane, FaUpload, FaTimes } from "react-icons/fa";
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
const reviewHeights = { front: 120, middle: 100, back: 80 };

const minGapY = 10; // espacio mínimo entre reviews
const containerPadding = 10; // evita que se corte en los bordes


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
  const [formData, setFormData] = useState({
    name: "",
    review: "",
    linkedinUrl: "",
    image: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const speed = 0.1;
  const containerHeight = 640;

  useEffect(() => {
    const positions: { top: number; height: number }[] = [];
    const baseReviews =
      reviews.length < 4 ? [...reviews, ...reviews.slice(0, 4 - reviews.length)] : reviews;

    const init = baseReviews.map((r, i) => {
      const depth = getRandomDepth();
      const y = generateNonOverlappingY(positions, depth, containerHeight);
      positions.push({ top: y, height: reviewHeights[depth] });
      return { id: `${r.data.name}-${i}`, x: getRandomBetween(-30, 100), y, depth, review: r };
    });
    setItems(init);
  }, [reviews]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item, i) => {
          let newX = item.x + speed;
          let newY = item.y;
          let newDepth = item.depth;
      
          if (newX > 110) {
            newDepth = getRandomDepth();
            const otherItems = prev.filter((_, idx) => idx !== i);
            newY = generateNonOverlappingY(
              otherItems.map((p) => ({ top: p.y, height: reviewHeights[p.depth] })),
              newDepth,
              containerHeight
            );
            newX = getRandomBetween(-40, -20);
          }
      
          // check dinámico: evita que se solapen al moverse
          prev.forEach((other, idx) => {
            if (i !== idx) {
              const h1 = reviewHeights[newDepth];
              const h2 = reviewHeights[other.depth];
              if (!(newY + h1 + minGapY <= other.y || newY >= other.y + h2 + minGapY)) {
                if (newY + h1 / 2 < other.y + h2 / 2) {
                  newY = other.y - h1 - minGapY;
                } else {
                  newY = other.y + h2 + minGapY;
                }
                // asegurar dentro de contenedor
                newY = Math.max(containerPadding, Math.min(containerHeight - h1 - containerPadding, newY));
              }
            }
          });
      
          return { ...item, x: newX, y: newY, depth: newDepth };
        })
      );      
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      if (name === "review" && value.length > 95) return;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "review") setCharCount(value.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("review", formData.review);
    if (formData.linkedinUrl) data.append("linkedinUrl", formData.linkedinUrl);
    if (formData.image) data.append("image", formData.image);
    try {
      await fetch("http://api.landing.pabloaf.com/create-review", { method: "POST", body: data });
      setShowForm(false);
      setFormData({ name: "", review: "", linkedinUrl: "", image: null });
      setPreviewUrl(null);
      setCharCount(0);
    } finally {
      setSubmitting(false);
    }
  };

  const depthStyles = {
    front: { scale: 1, blur: 0, opacity: 1, zIndex: 30 },
    middle: { scale: 0.85, blur: 0.75, opacity: 0.9, zIndex: 20 },
    back: { scale: 0.7, blur: 1, opacity: 0.6, zIndex: 10 },
  };

  return (
    <div className="tw-relative tw-w-full tw-h-[40rem] tw-flex tw-flex-col tw-items-center">
      {/* Título y botón */}
      <div className="tw-relative tw-mb-8 tw-w-full">
        <h2 className="tw-text-4xl tw-font-medium tw-text-gray-200 tw-text-center max-md:tw-text-3xl">
          Reviews
        </h2>
        <button
          className="tw-absolute tw-right-0 tw-top-1/2 -tw-translate-y-1/2 tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg tw-mr-4"
          onClick={() => setShowForm(true)}
        >
          Leave a review
        </button>
      </div>

      {/* Fondo con blur + bordes difuminados y degradado top/bottom */}
      <div
        className={`tw-relative tw-w-full tw-h-full tw-overflow-hidden tw-transition-all tw-duration-700 ${
          showForm ? "tw-blur-md tw-opacity-50" : "tw-blur-0 tw-opacity-100"
        }`}
      >
        {items.map((item) => {
          const d = depthStyles[item.depth];
          return (
            <a
              key={item.id}
              href={item.review.data.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tw-absolute tw-transition-transform tw-duration-300 hover:tw-scale-[1.03]"
              style={{
                top: `${item.y}px`,
                left: `${item.x}%`,
                transform: `scale(${d.scale})`,
                filter: `blur(${d.blur}px)`,
                opacity: d.opacity,
                zIndex: d.zIndex,
              }}
            >
              <div className="tw-flex tw-items-center tw-gap-4 tw-bg-white/20 tw-backdrop-blur-xl tw-border tw-border-white/30 tw-rounded-2xl tw-shadow-lg tw-px-5 tw-py-4 tw-w-[20rem]">
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
                  <span className="tw-text-white tw-font-semibold tw-tracking-wide tw-text-base">
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


      {/* Modal form */}
      <AnimatePresence>
        {showForm && (
          <>
            {/* Fondo clickeable para cerrar */}
            <motion.div
              className="tw-fixed tw-inset-0 tw-bg-black/50 tw-z-40"
              onClick={() => setShowForm(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-50"
            >
              <form
                onSubmit={handleSubmit}
                className="tw-bg-neutral-900/90 tw-border tw-border-white/10 tw-rounded-3xl tw-p-8 tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-gap-4 tw-backdrop-blur-xl tw-relative"
              >
                {/* Botón cerrar */}
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="tw-absolute tw-top-4 tw-right-4 tw-text-white/80 hover:tw-text-white"
                >
                  <FaTimes size={20} />
                </button>

                {/* Review con imagen dentro */}
                <div className="tw-bg-white/20 tw-backdrop-blur-xl tw-border tw-border-white/30 tw-rounded-2xl tw-px-5 tw-py-4 tw-w-[22rem] tw-flex tw-items-center tw-gap-4">
                  <div className="tw-relative tw-w-16 tw-h-16">
                    <img
                      src={previewUrl || "/reviews/default-avatar.jpg"}
                      alt="preview"
                      className="tw-w-full tw-h-full tw-object-cover tw-rounded-full tw-border tw-border-white/40"
                    />
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      id="image-upload"
                      onChange={handleFormChange}
                      className="tw-hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="tw-absolute tw-bottom-[-0.6rem] tw-right-[-0.6rem] tw-bg-purple-600 hover:tw-bg-purple-700 tw-text-white tw-p-2 tw-rounded-full tw-cursor-pointer tw-shadow-md"
                    >
                      <FaUpload size={14} />
                    </label>
                  </div>

                  <div className="tw-flex-1">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="tw-bg-transparent tw-text-white tw-font-semibold tw-tracking-wide tw-text-base tw-outline-none tw-w-full"
                    />
                    <textarea
                      name="review"
                      placeholder="Write your review (max 95 chars)"
                      value={formData.review}
                      onChange={handleFormChange}
                      className="tw-bg-transparent tw-text-white/80 tw-text-sm tw-leading-snug tw-w-full tw-mt-1 tw-resize-none tw-outline-none"
                    />
                    <div className="tw-text-right tw-text-white/60 tw-text-xs tw-mt-1">
                      {charCount}/95
                    </div>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="tw-flex tw-items-center tw-gap-2 tw-w-full tw-mt-6">
                  <FaLinkedin className="tw-text-[#0A66C2] tw-text-2xl" />
                  <input
                    type="text"
                    name="linkedinUrl"
                    placeholder="LinkedIn URL (optional)"
                    value={formData.linkedinUrl}
                    onChange={handleFormChange}
                    className="tw-px-4 tw-py-2 tw-rounded-md tw-bg-[#0A66C2]/20 tw-text-white tw-border tw-border-[#0A66C2]/40 tw-w-full focus:tw-ring-2 focus:tw-ring-[#0A66C2]"
                  />
                </div>

                {/* Enviar */}
                <motion.button
                  whileTap={{ scale: 0.9, rotate: -10 }}
                  disabled={submitting}
                  type="submit"
                  className="tw-bg-green-600 hover:tw-bg-green-700 tw-text-white tw-flex tw-items-center tw-gap-2 tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-all tw-duration-300 tw-mt-4"
                >
                  <FaPaperPlane className="tw-text-lg" />
                  {submitting ? "Sending..." : "Send"}
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
