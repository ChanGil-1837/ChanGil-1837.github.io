'use client';

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { MDXRemote } from 'next-mdx-remote'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Resizable } from "re-resizable";
import Image from 'next/image';

type Project = {
  id: string;
  slug: string | number;
  title: string;
  description: string;
  cover: string;
  start: string;
  end: string;
  link: string;
  tags: Array<{ name: string }>;
  content: any;
  relative: string[];
};

type ProjectModalProps = {
  project: Project;
  onClose: () => void;
  onOpenProjectBySlug: (slug: string | number) => void;
  allProjects: Project[];
};

const ProjectModalContext = createContext<{
  onOpenProjectBySlug: (slug: string | number) => void;
} | undefined>(undefined);

function useProjectModalContext() {
  const context = useContext(ProjectModalContext);
  if (!context) throw new Error('useProjectModalContext must be used within ProjectModalProvider');
  return context;
}

const DEFAULT_WIDTH = 768;

export default function ProjectModal({ project, onClose, onOpenProjectBySlug, allProjects }: ProjectModalProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: '90vh' });
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [selectedWidth, setSelectedWidth] = useState<'0' | '50' | '80'>('50');
  const [showRelatedProjects, setShowRelatedProjects] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const savedWidth = localStorage.getItem('projectModalWidth');
    if (savedWidth) {
      const savedWidthNum = Number(savedWidth);
      setSize(prev => ({ ...prev, width: savedWidthNum }));
    
      if (savedWidthNum === DEFAULT_WIDTH) setSelectedWidth('0');
      else if (savedWidthNum === window.innerWidth * 0.5) setSelectedWidth('50');
      else setSelectedWidth('80');
    } else {
      setSize(prev => ({ ...prev, width: window.innerWidth * 0.5 }));
    }
    setIsShowing(true);

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const components = {
    h1: ({ children }: { children: React.ReactNode }) => <h1 style={{ fontSize: '3em' }}>{children}</h1>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 style={{ fontSize: '2.2em' }}>{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3 style={{ fontSize: '1.7em' }}>{children}</h3>,
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>{children}</code>
      )
    },
    img: (props: any) => (
      <div className="w-full flex justify-center my-4">
        <Image
          src={props.src}
          alt={props.alt || ''}
          width={props.width || 700}
          height={props.height || 400}
          className="h-auto"
          onClick={() => setZoomedImage(props.src)}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    ),
    a: ({ children, href }: { children: React.ReactNode, href?: string }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="block text-center font-bold my-4 hover:underline text-red-600 dark:text-purple-400"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="bg-gray-100 border-l-4 border-gray-400 p-4 my-4 rounded-md italic">{children}</blockquote>
    )
  };

  if (!project) return null;

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => onClose(), 300);
  };

  const handleWidthChange = (option: '0' | '50' | '80') => {
    let targetWidth = DEFAULT_WIDTH;
    if (option === '50') targetWidth = window.innerWidth * 0.5;
    if (option === '80') targetWidth = window.innerWidth * 0.8;
    setSize(prev => ({ ...prev, width: targetWidth }));
    localStorage.setItem('projectModalWidth', targetWidth.toString());
    setSelectedWidth(option);
  };

  const widthOptions: { key: '0' | '50' | '80', label: string, sizeClass: string }[] = [
    { key: '0', label: '0', sizeClass: 'w-10 h-10' },
    { key: '50', label: '50%', sizeClass: 'w-12 h-12' },
    { key: '80', label: '80%', sizeClass: 'w-16 h-16' }
  ];
  const isLinkValid = project.link && project.link !== "No Link" && project.link.trim() !== '';


  return (
    <ProjectModalContext.Provider value={{ onOpenProjectBySlug }}>
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 flex ${isMobile ? 'items-end' : 'justify-center items-center'} transition-opacity duration-300 ease-in-out backdrop-blur-sm ${isShowing ? 'bg-black bg-opacity-50' : 'bg-transparent'}`}
          onClick={() => !zoomedImage && handleClose()}
        >
          {/* Modal */}
          <Resizable
            size={isMobile ? { width: '100%', height: '95vh' } : { width: size.width, height: size.height }}
            enable={{ left: false, right: false, top: false, bottom: false }}
            style={{ transition: 'width 0.4s ease, height 0.4s ease' }}
            className={`relative transform transition-all duration-300 ease-in-out ${isShowing ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
          >
            <div className="flex h-full">
              <div
                className={`bg-white dark:bg-gray-800 ${isMobile ? 'rounded-t-2xl' : 'rounded-2xl'} ${isMobile ? 'p-4' : 'p-8'} w-full h-full overflow-y-auto relative`}
                onClick={(e) => e.stopPropagation()} draggable={false}
              >
                {/* Header */}
                <div className={`sticky -top-8 bg-white dark:bg-gray-800 ${isMobile ? 'p-4' : 'p-8'} pb-4 z-50 border-b border-gray-200 dark:border-gray-700`}>
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-2xl font-bold z-50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    &times;
                  </button>
                  <h1 className="text-3xl font-bold my-4">{project.title}</h1>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLinkValid) return;
                      window.open(project.link, '_blank');
                    }}
                    disabled={!isLinkValid}
                    className={`mt-4 px-4 py-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 ease-in-out
                              ${isLinkValid
                                ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800'
                                : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                  >
                    View Repository
                  </button>


                  {/* Width buttons */}
                  {!isMobile && <div className="absolute top-4 right-16 flex items-center z-50">
                    {widthOptions.map((option, idx) => (
                      <div key={option.key} className="relative">
                        {selectedWidth === option.key && (
                          <div className={`${option.sizeClass} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full -z-10`} />
                        )}
                        <button
                          onClick={() => handleWidthChange(option.key)}
                          className={`${option.sizeClass} bg-gray-400 text-white text-sm font-bold rounded-full border-2 border-white hover:bg-gray-500 transition-all duration-300 flex items-center justify-center`}
                          style={{
                            marginLeft: idx === 0 ? 0 : -8,
                            transform: selectedWidth === option.key ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.3s ease-in-out',
                          }}
                        >
                          {option.label}
                        </button>
                      </div>
                    ))}
                  </div>}
                </div>

                {/* Content */}
                <article className="prose dark:prose-invert lg:prose-xl max-w-none pt-4 break-words">
                  <MDXRemote {...project.content} components={{ ...components, OpenProjectLink }} />
                </article>
              </div>
            </div>
          </Resizable>
        </div>

        {/* Related List */}
        {project.relative && project.relative.length > 0 && (
          <div
            className="fixed top-1/2 -translate-y-1/2 w-64 rounded-l-2xl p-4 overflow-y-auto z-50 shadow-lg transform transition-transform duration-300 ease-in-out"
            style={{ right: showRelatedProjects ? '0' : '-256px' }}
          >
            <button
              onClick={() => setShowRelatedProjects(false)}
              className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-gray-100 dark:bg-gray-700 rounded-l-lg flex items-center justify-center shadow-lg text-2xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Related Projects</h3>
            <ul className="space-y-2">
              {project.relative.map((relatedSlug) => {
                const relatedProject = allProjects.find(p => p.slug === relatedSlug);
                if (!relatedProject) return null;
                return (
                  <li key={relatedSlug}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProjectBySlug(relatedSlug);
                        setShowRelatedProjects(false);
                      }}
                      className="block w-full text-left text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-200 transform hover:scale-105 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {relatedProject.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      {/* Related Toggle Button */}
      {project.relative && project.relative.length > 0 && (
        <button
          onClick={() => setShowRelatedProjects(!showRelatedProjects)}
          className="fixed top-1/2 -translate-y-1/2 bg-blue-500 text-white shadow-lg z-50 transform transition-all duration-300 ease-in-out rounded-2xl flex items-center justify-center overflow-hidden"
          style={{
            width: '48px',      // 버튼 너비 고정
            height: '120px',    // 버튼 높이 길게
            right: showRelatedProjects ? '280px' : '16px', // 오른쪽 살짝 띄우기
            writingMode: 'vertical-rl', // 세로쓰기
            textOrientation: 'mixed',   // 한글/영문 혼합 세로쓰기
            padding: '8px',
          }}
        >
          Related
        </button>
      )}


        {/* Zoomed Image */}
        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-70"
            onClick={() => setZoomedImage(null)}
          >
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-[90vw] max-h-[95vh] object-contain"
            />
          </div>
        )}
      </>
    </ProjectModalContext.Provider>
  );
}

const OpenProjectLink = ({ slug, children }: { slug: string | number; children: React.ReactNode }) => {
  const { onOpenProjectBySlug } = useProjectModalContext();
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onOpenProjectBySlug(slug);
      }}
      className="text-blue-500 hover:underline cursor-pointer"
    >
      {children}
    </a>
  );
};