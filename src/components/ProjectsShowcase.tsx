import React from "react";
import DotGrid from "./Dotgrid";
import ProjectCard from "./ProjectCard";
import type { InferEntrySchema } from "astro:content";

interface ProjectsShowcaseProps {
  projects: Array<{ data: InferEntrySchema<"project">; slug: string; body: string }>;
  limit?: number;
}

const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({ projects, limit = 6 }) => {
  const visibleProjects = projects.slice(0, limit);

  return (
    <section className="tw-relative tw-w-screen tw-h-screen tw-overflow-hidden tw-flex tw-flex-col tw-items-center tw-justify-start tw-bg-black">
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
      <h2 className="tw-z-20 tw-mt-10 tw-text-4xl tw-font-medium tw-text-gray-200 tw-text-center max-md:tw-text-3xl">
        Projects
      </h2>

      {/* Contenedor de proyectos */}
      <div
        className="
          tw-relative tw-z-20 tw-flex tw-flex-wrap tw-gap-12 tw-justify-center tw-items-start
          tw-w-full tw-max-w-[1600px] tw-px-12 tw-pt-16 tw-overflow-hidden
        "
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)", // 👈 degradado más fuerte
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
        }}
      >
        {visibleProjects.map((entry, idx) => (
          <ProjectCard
            key={idx}
            project={entry.data}
            slug={entry.slug}
            className="tw-flex-grow tw-basis-[30%] max-xl:tw-basis-[45%] max-md:tw-basis-[90%] tw-flex tw-justify-center"
          />
        ))}
      </div>

      {/* Botón “Ver todos” */}
      <div className="tw-absolute tw-bottom-8 tw-z-30 tw-flex tw-justify-center tw-w-full">
        <a
          href="/projects"
          className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-[#5227FF] hover:tw-bg-[#6a44ff] tw-text-white tw-font-semibold tw-rounded-full tw-px-6 tw-py-3 tw-transition-colors tw-shadow-lg"
        >
          Ver todos los proyectos
        </a>
      </div>
    </section>
  );
};

export default ProjectsShowcase;
