import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaPaperPlane, FaUpload, FaTimes } from "react-icons/fa";

interface ReviewFormProps {
  onClose: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    review: "",
    linkedinUrl: "",
    image: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    if (formData.image) data.append("image", formData.image);

    try {
      await fetch("http://api.landing.pabloaf.com/create-review", { method: "POST", body: data });
      onClose();
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
      <form
        onSubmit={handleSubmit}
        className="tw-bg-neutral-900/90 tw-border tw-border-white/10 tw-rounded-3xl tw-p-8 tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-gap-6 tw-backdrop-blur-xl tw-relative tw-w-[28rem] md:tw-w-[36rem]"
      >
        <button
          type="button"
          onClick={onClose}
          className="tw-absolute tw-top-4 tw-right-4 tw-text-white/80 hover:tw-text-white"
        >
          <FaTimes size={22} />
        </button>

        {/* Top Row: Avatar + Name */}
        <div className="tw-flex tw-w-full tw-gap-4 tw-items-center">
          <div className="tw-relative tw-w-20 tw-h-20">
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

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleFormChange}
            className="tw-flex-1 tw-bg-transparent tw-text-white tw-font-semibold tw-text-lg tw-tracking-wide tw-outline-none tw-border-b tw-border-white/30 tw-py-2"
          />
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
      </form>
    </motion.div>
  );
};

export default ReviewForm;
