import React from "react";
import { motion } from "framer-motion";
import DotGrid from "./Dotgrid"; 
import type { InferEntrySchema } from "astro:content";

interface ProjectsShowcaseProps {
  projects: Array<{ data: InferEntrySchema<"project">; body: string }>;
  limit?: number; 
}

const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({ projects, limit = 3 }) => {
  const visibleProjects = projects.slice(0, limit);

  return (
    <div className="tw-relative tw-w-screen tw-h-screen tw-overflow-hidden tw-flex tw-flex-col tw-items-center">
      {/* Fondo animado */}
      <DotGrid
        dotSize={4}
        gap={13}
        baseColor="#212121"
        activeColor="#adadad"
        proximity={200}
        shockRadius={400}
        shockStrength={6}
        resistance={750}
        returnDuration={1.5}
      />

      {/* Título */}
      <h2 className="tw-z-10 tw-mt-10 tw-text-4xl tw-font-medium tw-text-gray-200 tw-text-center max-md:tw-text-3xl">
        Projects
      </h2>

      {/* Carrusel de proyectos */}
      <div className="tw-relative tw-z-10 tw-w-full tw-overflow-x-auto tw-px-6 tw-pt-16 tw-flex tw-gap-12 tw-scrollbar-hide 
                      max-md:tw-flex-col max-md:tw-items-center max-md:tw-gap-8">
        {visibleProjects.map((entry, index) => {
          const project = entry.data;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="tw-w-[35em] max-md:tw-w-11/12 tw-bg-neutral-900/90 tw-rounded-2xl tw-shadow-lg tw-flex tw-flex-col tw-overflow-hidden tw-border tw-border-neutral-800 tw-backdrop-blur-md"
            >
              {project.imagen && (
                <img
                  src={project.imagen}
                  alt={project.titulo}
                  className="tw-w-full tw-h-64 tw-object-cover"
                />
              )}

              <div className="tw-p-6 tw-text-center tw-text-neutral-200 tw-flex tw-flex-col tw-gap-3 tw-flex-grow">
                <h3 className="tw-text-2xl tw-font-semibold tw-text-white">
                  {project.titulo}
                </h3>

                <p className="tw-text-sm tw-text-neutral-400">
                  {project.fechaInicio} {project.fechaFin ? `– ${project.fechaFin}` : ""}
                </p>

                {project.skills && project.skills.length > 0 && (
                  <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-2 tw-mt-2">
                    {project.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="tw-text-sm tw-bg-[#5227FF]/30 tw-text-[#B0AFFF] tw-px-3 tw-py-1 tw-rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {project.descripcion && (
                  <p className="tw-text-base tw-mt-3 tw-text-neutral-400 tw-line-clamp-4">
                    {project.descripcion}
                  </p>
                )}

                {project.githubUrl && (
                  <div className="tw-mt-auto tw-pt-4">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-[#5227FF] hover:tw-bg-[#6a44ff] tw-text-white tw-font-medium tw-rounded-full tw-px-5 tw-py-2 tw-transition-colors"
                    >
                      <img
                        src="/github.png"
                        alt="GitHub"
                        className="tw-w-6 tw-h-6 tw-object-contain"
                      />
                      <span>Ver en GitHub</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Botón "View All" */}
      <div className="tw-relative tw-z-10 tw-mt-6 tw-mb-10">
        <a
          href="/projects"
          className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-[#5227FF] hover:tw-bg-[#6a44ff] tw-text-white tw-font-semibold tw-rounded-full tw-px-6 tw-py-3 tw-transition-colors"
        >
          Ver todos los proyectos
        </a>
      </div>
    </div>
  );
};

export default ProjectsShowcase;
