'use client';

import { useState, useEffect, useRef } from "react";
import { MDXRemote } from 'next-mdx-remote'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Resizable } from "re-resizable";
import Image from 'next/image';
type Project = {
  id: string;
  title: string;
  description: string;
  cover: string;
  start: string;
  end:string;
  link: string;
  tags: Array<{ name: string }>;
  content: any;
};

type ProjectModalProps = {
  project: Project;
  onClose: () => void;
};

const DEFAULT_WIDTH = 768;

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: '90vh' });
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [selectedWidth, setSelectedWidth] = useState<'0' | '50' | '80'>('0');

  useEffect(() => {
    const savedWidth = localStorage.getItem('projectModalWidth');
    if (savedWidth) {
      const savedWidthNum = Number(savedWidth);
      setSize(prev => ({ ...prev, width: savedWidthNum }));

      if (savedWidthNum === DEFAULT_WIDTH) setSelectedWidth('0');
      else if (savedWidthNum === window.innerWidth * 0.5) setSelectedWidth('50');
      else setSelectedWidth('80');
    }
    setIsShowing(true);
  }, []);

  const components = {
    h1: ({ children }: { children: React.ReactNode }) => <h1 style={{ fontSize: '3em' }}>{children}</h1>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 style={{ fontSize: '2.2em' }}>{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3 style={{ fontSize: '1.7em' }}>{children}</h3>,
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
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
          className="h-auto" // width는 부모 div에 맞춤
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
    className="block text-center font-bold my-4 hover:underline
               text-red-600 dark:text-purple-400"
  >
    {children}
  </a>
),

    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="bg-gray-100 border-l-4 border-gray-400 p-4 my-4 rounded-md italic">{children}</blockquote>
    )
  }

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

  return (
    <>
      <div
        className={`fixed inset-0 z-40 flex justify-center items-center transition-opacity duration-300 ease-in-out backdrop-blur-sm ${
          isShowing ? 'bg-black bg-opacity-50' : 'bg-transparent'
        }`}
        onClick={() => !zoomedImage && handleClose()}
      >
        <Resizable
          size={{ width: size.width, height: size.height }}
          enable={{ left: false, right: false, top: false, bottom: false }}
          style={{ transition: 'width 0.4s ease' }}
          className={`relative transform transition-all duration-300 ease-in-out ${
            isShowing ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full h-full overflow-y-auto relative"
               onClick={(e) => e.stopPropagation()} draggable={false}>

            <button onClick={handleClose}
                    className="absolute top-4 right-4 text-2xl font-bold z-50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200">&times;</button>

            {/* 동그라미 버튼 그룹 */}
            <div className="absolute top-4 right-16 flex items-center z-50">
              {widthOptions.map((option, idx) => (
                <div key={option.key} className="relative">
                  {selectedWidth === option.key && (
                    <div className={`${option.sizeClass} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full -z-10`} />
                  )}
                  <button
                    onClick={() => handleWidthChange(option.key)}
                    className={`${option.sizeClass} bg-gray-400 text-white text-sm font-bold rounded-full border-2 border-white hover:bg-gray-500 transition-all duration-300 flex items-center justify-center`}
                    style={{
                      marginLeft: idx === 0 ? 0 : -8, // 버튼 겹치기
                      transform: selectedWidth === option.key ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.3s ease-in-out',
                    }}
                  >
                    {option.label}
                  </button>
                </div>
              ))}
            </div>


            <article className="prose dark:prose-invert lg:prose-xl max-w-none">
              <h1 className="text-3xl font-bold my-4">{project.title}</h1>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-4">
                Visit Repository
              </a>
              <MDXRemote {...project.content} components={components} />
            </article>
          </div>
        </Resizable>
      </div>

      {/* Zoomed Image Modal */}
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
  );
}

