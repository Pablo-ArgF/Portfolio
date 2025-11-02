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

const reviewHeights = {
  front: 120,
  middle: 100,
  back: 80,
};

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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    review: "",
    linkedinUrl: "",
    image: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const speed = 0.1;
  const containerHeight = 640; // coincide con tw-h-[40rem]

  // Inicialización de reviews animadas
  useEffect(() => {
    const positions: { top: number; height: number }[] = [];
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

  // Form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("review", formData.review);
    if (formData.linkedinUrl) data.append("linkedinUrl", formData.linkedinUrl);
    if (formData.image) data.append("image", formData.image);

    try {
      const res = await fetch("http://api.landing.pabloaf.com/create-review", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (res.ok) {
        setSuccess(`PR created: ${json.prUrl}`);
        setFormData({ name: "", review: "", linkedinUrl: "", image: null });
      } else {
        setError(json.error || "Error creating PR");
      }
    } catch (err) {
      setError((err as any).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
        {/* Cabecera con título centrado y botón a la derecha */}
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-8 tw-w-full max-md:tw-flex-col max-md:tw-items-center">
        <h2 className="tw-text-4xl tw-font-medium tw-text-gray-200 max-md:tw-text-3xl tw-text-center tw-flex-1">
            Reviews
        </h2>
        <button
            className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg tw-mr-4 max-md:tw-mt-4"
            onClick={() => setShowForm((prev) => !prev)}
        >
            Leave a review
        </button>
        </div>

        {/* Formulario embellecido */}
        {showForm && (
        <form
            className="tw-max-w-lg tw-mx-auto tw-bg-white/10 tw-backdrop-blur-xl tw-p-8 tw-rounded-3xl tw-shadow-lg tw-flex tw-flex-col tw-gap-5 tw-mb-12"
            onSubmit={handleSubmit}
        >
            <input
            type="text"
            name="name"
            placeholder="Name and Surname"
            value={formData.name}
            onChange={handleFormChange}
            required
            className="tw-px-5 tw-py-3 tw-rounded-xl tw-border tw-border-gray-400 tw-bg-white/20 tw-backdrop-blur-sm focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-transition-all tw-duration-300"
            />
            <textarea
            name="review"
            placeholder="Your review"
            value={formData.review}
            onChange={handleFormChange}
            required
            className="tw-px-5 tw-py-3 tw-rounded-xl tw-border tw-border-gray-400 tw-bg-white/20 tw-backdrop-blur-sm focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-transition-all tw-duration-300 tw-resize-none tw-h-32"
            />
            <input
            type="text"
            name="linkedinUrl"
            placeholder="LinkedIn URL (optional)"
            value={formData.linkedinUrl}
            onChange={handleFormChange}
            className="tw-px-5 tw-py-3 tw-rounded-xl tw-border tw-border-gray-400 tw-bg-white/20 tw-backdrop-blur-sm focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-transition-all tw-duration-300"
            />

            {/* Botón de subida de imagen estilizado */}
            <div className="tw-relative">
            <input
                type="file"
                name="image"
                accept="image/*"
                id="image-upload"
                onChange={handleFormChange}
                className="tw-absolute tw-w-0 tw-h-0 tw-overflow-hidden"
            />
            <label
                htmlFor="image-upload"
                className="tw-cursor-pointer tw-bg-purple-600 hover:tw-bg-purple-700 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg tw-block tw-text-center tw-font-medium tw-transition-all tw-duration-300"
            >
                Upload profile image (optional)
            </label>
            {formData.image && (
                <span className="tw-ml-2 tw-text-white/80 tw-text-sm">
                {formData.image.name}
                </span>
            )}
            </div>

            <button
            type="submit"
            disabled={submitting}
            className="tw-bg-green-600 hover:tw-bg-green-700 tw-text-white tw-px-6 tw-py-3 tw-rounded-xl tw-font-medium tw-transition-all tw-duration-300"
            >
            {submitting ? "Submitting..." : "Submit Review"}
            </button>

            {success && <p className="tw-text-green-400">{success}</p>}
            {error && <p className="tw-text-red-400">{error}</p>}
        </form>
        )}



      {/* Reviews animadas */}
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
