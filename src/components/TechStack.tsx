
import React from 'react';

const technologies = [
    { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
    { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
    { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    { name: 'SQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
    { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    { name: 'Angular', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg' },
    { name: 'Thymeleaf', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/thymeleaf/thymeleaf-original.svg' },
    { name: 'Oracle', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg' },
    { name: 'MariaDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg' },
    { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
    { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
    { name: 'Spring Boot', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
    { name: 'Hibernate', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/hibernate/hibernate-original.svg' },
    { name: 'Lombok', icon: 'https://raw.githubusercontent.com/projectlombok/lombok/04876622d9ceeed82a97ff5463e6052bb46a08c3/src/installer/lombok/installer/lombok.svg' },
    { name: 'MapStruct', icon: 'https://mapstruct.org/images/mapstruct.png' },
    { name: 'TensorFlow', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg' },
    { name: 'Pandas', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg' },
    { name: 'NumPy', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg' },
    { name: 'Kotlin', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg' },
    { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
    { name: 'GitHub', icon: 'https://cdn.simpleicons.org/github/white' },
    { name: 'GitLab', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg' },
    { name: 'Cypress', icon: 'https://cdn.simpleicons.org/cypress/white' },
    { name: 'JUnit', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/junit/junit-original.svg' },
    { name: 'Nginx', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg' },
    { name: 'GitHub Actions', icon: 'https://cdn.simpleicons.org/githubactions/white' },
    { name: 'GitLab CI', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg' },
    { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
    { name: 'Express', icon: 'https://www.manektech.com/storage/developer/1646733543.webp' },
    { name: 'Flask', icon: 'https://cdn.simpleicons.org/flask/white' },
    { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
    { name: 'Bootstrap', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg' },
    { name: 'PHP', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' },
    { name: 'C#', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
];

export default function TechStack() {
    return (
        <div className="tw-relative tw-w-full tw-max-w-[100vw] tw-overflow-hidden tw-py-8">
            {/* Gradient masks for smooth fade effect at edges */}
            <div className="tw-absolute tw-left-0 tw-top-0 tw-z-10 tw-h-full tw-w-[100px] tw-bg-gradient-to-r tw-from-black tw-to-transparent tw-pointer-events-none" />
            <div className="tw-absolute tw-right-0 tw-top-0 tw-z-10 tw-h-full tw-w-[100px] tw-bg-gradient-to-l tw-from-black tw-to-transparent tw-pointer-events-none" />

            <div className="tw-flex tw-w-max animate-infinite-scroll hover:[animation-play-state:paused]">
                {/* Render the list twice to create the infinite effect */}
                {[...technologies, ...technologies].map((tech, index) => (
                    <div
                        key={index}
                        className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mx-8 tw-group"
                    >
                        <div className="tw-w-[80px] tw-h-[80px] md:tw-w-[90px] md:tw-h-[90px] tw-flex tw-items-center tw-justify-center tw-transition-transform tw-duration-300 group-hover:tw-scale-110 group-hover:-tw-translate-y-2">
                            <img
                                src={tech.icon}
                                alt={tech.name}
                                className="tw-w-full tw-h-full tw-object-contain tw-filter tw-grayscale tw-opacity-70 tw-transition-all tw-duration-300 group-hover:tw-grayscale-0 group-hover:tw-opacity-100"
                            />
                        </div>
                        <span className="tw-mt-2 tw-text-sm tw-text-gray-400 tw-opacity-0 tw-transition-opacity tw-duration-300 group-hover:tw-opacity-100">
                            {tech.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
