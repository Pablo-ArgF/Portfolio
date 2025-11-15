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
  const [charCount, setCharCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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
        className="tw-bg-neutral-900/90 tw-border tw-border-white/10 tw-rounded-3xl tw-p-8 tw-shadow-2xl tw-flex tw-flex-col tw-items-center tw-gap-4 tw-backdrop-blur-xl tw-relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="tw-absolute tw-top-4 tw-right-4 tw-text-white/80 hover:tw-text-white"
        >
          <FaTimes size={20} />
        </button>

        {/* Avatar + texto */}
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
            <div className="tw-text-right tw-text-white/60 tw-text-xs tw-mt-1">{charCount}/95</div>
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

        {/* Submit */}
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
  );
};

export default ReviewForm;
