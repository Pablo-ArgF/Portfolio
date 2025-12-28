import React from "react";
import { motion } from "framer-motion";
import type { InferEntrySchema } from "astro:content";
import { trackEvent } from "../utils/analytics";

interface ProjectCardProps {
  project: InferEntrySchema<"project">;
  className?: string;
  slug?: string;
  fullDetail?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className = "", slug, fullDetail = false }) => {

  const containerClasses = fullDetail
    ? "tw-w-[85%] sm:tw-w-full tw-max-w-[22em] sm:tw-max-w-[30em] tw-min-h-[28rem] sm:tw-min-h-[450px]"
    : "tw-w-[85%] sm:tw-w-full tw-max-w-[22em] sm:tw-max-w-[30em] tw-min-h-[28rem] sm:tw-min-h-[450px]";

  const imageHeight = fullDetail
    ? "tw-h-56 sm:tw-h-72"
    : "tw-h-48 sm:tw-h-72";

  const paddingClasses = fullDetail
    ? "tw-p-6 sm:tw-p-6"
    : "tw-p-4 sm:tw-p-6";

  const titleSize = fullDetail
    ? "tw-text-2xl sm:tw-text-3xl"
    : "tw-text-lg sm:tw-text-2xl md:tw-text-3xl lg:tw-text-2xl";

  const tagSize = fullDetail
    ? "tw-text-sm sm:tw-text-base sm:tw-px-3"
    : "tw-text-[10px] sm:tw-text-sm md:tw-text-base tw-px-2 sm:tw-px-3";

  const descSize = fullDetail
    ? "tw-text-base sm:tw-text-base md:tw-text-lg"
    : "tw-text-sm sm:tw-text-base md:tw-text-lg";

  const btnTextSize = fullDetail
    ? "tw-text-base sm:tw-text-base"
    : "tw-text-sm sm:tw-text-base";

  const dateSize = fullDetail
    ? "tw-text-sm sm:tw-text-lg"
    : "tw-text-xs sm:tw-text-lg md:tw-text-lg";

  return (
    <a
      href={`/projects/${slug}`}
      className={`tw-text-current tw-no-underline tw-flex tw-justify-center ${className}`}
      onClick={() => trackEvent("Project Card Click", { project: project.titulo })}
    >
      <motion.div
        whileHover={{ scale: 1.06, zIndex: 20 }}
        transition={{ duration: 0.15 }}
        className={`
            tw-bg-neutral-900/90 tw-rounded-2xl tw-shadow-lg tw-flex tw-flex-col
            tw-overflow-hidden tw-border tw-border-neutral-800 tw-transition-transform
            tw-duration-150 tw-cursor-pointer tw-relative
            ${containerClasses}
            sm:tw-h-[35em] md:tw-h-[40em] lg:tw-h-[40em]
          `}
      >
        {/* Imagen */}
        {project.imagen && (
          <div className="tw-flex-shrink-0">
            <img
              src={project.imagen}
              alt={project.titulo}
              className={`tw-w-full ${imageHeight} tw-object-cover tw-object-center`}
            />
          </div>
        )}

        {/* Contenido */}
        <div className={`${paddingClasses} tw-text-center tw-text-neutral-200 tw-flex tw-flex-col tw-flex-grow tw-justify-between`}>
          <div className="tw-flex tw-flex-col tw-gap-3">
            {/* Título */}
            <h3 className={`${titleSize} tw-font-semibold tw-text-white`}>
              {project.titulo}
            </h3>

            {/* Fechas */}
            <p className={`${dateSize} tw-text-neutral-400`}>
              {project.fechaInicio} {project.fechaFin ? `– ${project.fechaFin}` : " - now"}
            </p>

            {/* Skills */}
            {project.skills && project.skills.length > 0 && (
              <div className="tw-flex tw-justify-center tw-mt-2 tw-w-full">
                <div className="tw-flex tw-flex-nowrap tw-gap-2 tw-overflow-hidden tw-max-w-full [mask-image:linear-gradient(to_right,black_85%,transparent_100%)]">
                  {project.skills.map((skill, i) => (
                    <span
                      key={i}
                      className={`${tagSize} tw-bg-[#5227FF]/30 tw-text-[#B0AFFF] tw-py-1 tw-rounded-full tw-whitespace-nowrap tw-flex-shrink-0`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            {project.descripcion && (
              <p className={`${descSize} tw-mt-3 tw-text-neutral-400 tw-line-clamp-3`}>
                {project.descripcion}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="tw-mt-4 tw-flex tw-gap-2 tw-justify-center">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent("Project Github Click", { project: project.titulo });
                }}
                className={`tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-[#5227FF] hover:tw-bg-[#6a44ff]
                           tw-text-white tw-font-medium tw-rounded-full tw-px-5 tw-py-2 tw-transition-colors ${btnTextSize}`}
              >
                <img src="/github.png" alt="GitHub" className="tw-w-5 sm:tw-w-6 tw-h-5 sm:tw-h-6 tw-object-contain" />
                <span>GitHub</span>
              </a>
            )}

            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent("Project Demo Click", { project: project.titulo });
                }}
                className={`tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-white hover:tw-bg-gray-200
                           tw-text-black tw-font-medium tw-rounded-full tw-px-5 tw-py-2 tw-transition-colors ${btnTextSize}`}
              >
                <span>Visit</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="tw-h-4 tw-w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </a>
  );
};

export default ProjectCard;
