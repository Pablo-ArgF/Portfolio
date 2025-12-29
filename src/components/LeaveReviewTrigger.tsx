import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import ReviewForm from "./ReviewForm";

const LeaveReviewTrigger: React.FC = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowForm(true)}
                className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 
                  tw-bg-[#5227FF] hover:tw-bg-[#6a44ff] tw-text-white 
                  tw-font-semibold tw-rounded-full tw-px-5 tw-py-2.5 tw-text-sm md:tw-px-8 md:tw-py-4 md:tw-text-base
                  tw-transition-colors tw-shadow-lg tw-shadow-[#5227FF]/60"
            >
                <FaPaperPlane className="tw-w-4 tw-h-4 md:tw-w-5 md:tw-h-5 tw-animate-pulse" />
                <span>Leave a Review</span>
            </button>

            <AnimatePresence>
                {showForm && (
                    <>
                        <motion.div
                            className="tw-fixed tw-inset-0 tw-bg-black/50 tw-z-[60]"
                            onClick={() => setShowForm(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-[70] tw-pointer-events-none">
                            <div className="tw-pointer-events-auto">
                                <ReviewForm onClose={() => setShowForm(false)} />
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default LeaveReviewTrigger;
