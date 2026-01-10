import React, { useState, useEffect } from "react";
import { ReviewCardStatic } from "./ReviewCardStatic";
import type { InferEntrySchema } from "astro:content";

interface MasonryGridProps {
    reviews: { data: InferEntrySchema<"review">; body: string }[];
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ reviews }) => {
    const [columns, setColumns] = useState(1);

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth >= 1024) {
                setColumns(3);
            } else if (window.innerWidth >= 768) {
                setColumns(2);
            } else {
                setColumns(1);
            }
        };

        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, []);

    const getColumnItems = (colIndex: number) => {
        return reviews.filter((_, index) => index % columns === colIndex);
    };

    return (
        <div
            className={`tw-grid tw-gap-10 tw-w-full tw-max-w-7xl tw-mx-auto tw-px-[clamp(1rem,3vw,5rem)] tw-pt-10 tw-pb-20`}
            style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                alignItems: 'start'
            }}
        >
            {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="tw-flex tw-flex-col tw-gap-10">
                    {getColumnItems(colIndex).map((review, idx) => (
                        <ReviewCardStatic key={`${colIndex}-${idx}`} review={review} />
                    ))}
                </div>
            ))}
        </div>
    );
};
