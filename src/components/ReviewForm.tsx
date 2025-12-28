import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaPaperPlane, FaUpload, FaTimes, FaCheckCircle } from "react-icons/fa";

interface ReviewFormProps {
  onClose: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    review: "",
    linkedinUrl: "",
    position: "",
    image: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(""); // limpiar error al modificar cualquier campo
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!formData.name.trim() || !formData.review.trim()) {
      setError("Please provide both your name and a review.");
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("review", formData.review);
    if (formData.linkedinUrl) data.append("linkedinUrl", formData.linkedinUrl);
    if (formData.position) data.append("position", formData.position);
    if (formData.image) data.append("image", formData.image);

    try {
      await fetch("https://landing.pabloaf.com/create-review", { method: "POST", body: data });
      setIsSuccess(true);
      // Cerrar automáticamente después de 3 segundos
      setTimeout(() => {
        onClose();
      }, 6000);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-50"
    >
      <div className="tw-bg-neutral-900/90 tw-border tw-border-white/10 tw-rounded-3xl tw-p-8 tw-shadow-2xl tw-backdrop-blur-xl tw-relative tw-w-[28rem] md:tw-w-[36rem] tw-overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="tw-absolute tw-top-4 tw-right-4 tw-text-white/80 hover:tw-text-white tw-z-10"
        >
          <FaTimes size={22} />
        </button>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-py-10 tw-gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="tw-text-green-500"
              >
                <FaCheckCircle size={80} />
              </motion.div>
              <h3 className="tw-text-2xl tw-font-bold tw-text-white">Review Submitted!</h3>
              <p className="tw-text-neutral-400 tw-max-w-xs">
                Thank you for your feedback. Your review has been sent efficiently and will be posted after a quick verification.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="tw-flex tw-flex-col tw-items-center tw-gap-6"
            >
              {/* Top Row: Avatar + Name + Position */}
              <div className="tw-flex tw-w-full tw-gap-4 tw-items-start">
                <div className="tw-relative tw-w-20 tw-h-20 tw-flex-shrink-0">
                  <img
                    src={previewUrl || "/reviews/default-avatar.jpg"}
                    alt="preview"
                    className="tw-w-full tw-h-full tw-object-cover tw-rounded-full tw-border tw-border-white/30"
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
                    className="tw-absolute tw-bottom-[-0.5rem] tw-right-[-0.5rem] tw-bg-purple-600 hover:tw-bg-purple-700 tw-text-white tw-p-2 tw-rounded-full tw-cursor-pointer tw-shadow-md"
                  >
                    <FaUpload size={14} />
                  </label>
                </div>

                <div className="tw-flex tw-flex-col tw-flex-1 tw-gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="tw-bg-transparent tw-text-white tw-font-semibold tw-text-lg tw-tracking-wide tw-outline-none tw-border-b tw-border-white/30 tw-py-2"
                  />
                  <input
                    type="text"
                    name="position"
                    placeholder="Your Position/Role (optional)"
                    value={formData.position}
                    onChange={handleFormChange}
                    className="tw-bg-transparent tw-text-white/60 tw-text-sm tw-italic tw-outline-none tw-border-b tw-border-white/20 tw-py-1"
                  />
                </div>
              </div>

              {/* Textarea for Review */}
              <textarea
                name="review"
                placeholder="Write your review..."
                value={formData.review}
                onChange={handleFormChange}
                className="tw-bg-transparent tw-text-white/80 tw-text-base tw-leading-relaxed tw-w-full tw-h-48 tw-resize-none tw-rounded-lg tw-p-4 tw-border tw-border-white/20 focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-outline-none"
              />

              {/* LinkedIn */}
              <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
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

              {/* Error */}
              {error && <p className="tw-text-red-400 tw-text-sm tw-mt-1">{error}</p>}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={submitting}
                type="submit"
                className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-text-white tw-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-rounded-lg tw-font-medium tw-transition-all tw-duration-300"
              >
                <FaPaperPlane className="tw-text-lg" />
                {submitting ? "Sending..." : "Send"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReviewForm;
