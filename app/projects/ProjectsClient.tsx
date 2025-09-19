
'use client';
import { useState } from 'react';
import ProjectItem from './project-item';
import ProjectModal from './ProjectModal'; // Import the modal component
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

type Project = {
  id: string;
  slug: string | number; // Ensure slug is present
  title: string;
  description: string;
  cover: string;
  start: string;
  end: string;
  link: string;
  tags: Array<{ name: string }>;
  content: any;
  imageSlides: { src: string }[];
};

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>(['project']);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags.map((t) => t.name)))
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const filteredProjects =
    selectedTags.length === 0
      ? projects
      : projects.filter((p) => selectedTags.some((tag) => p.tags.map((t) => t.name).includes(tag)));

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
            블로그 
          </h1>
          <h2>
            수리중...
          </h2>
        </div>

        {/* 태그 필터 버튼 */}
        <div className="flex justify-center flex-wrap mt-4 gap-2">
          {['project', 'study'].map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded ${
                selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex justify-center flex-wrap mt-2 gap-2">
          {allTags.filter(t => !['project', 'study'].includes(t)).map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded ${
                selectedTags.includes(tag) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 프로젝트 리스트 */}
        <div className="masonry-container py-10 m-6 sm:w-full">
          {filteredProjects.map((project) => (
            <ProjectItem key={project.id} project={project} onProjectClick={handleProjectClick} />
          ))}
        </div>
      </div>

      {/* 모달 렌더링 */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={handleCloseModal} />
      )}
    </section>
  );
}

