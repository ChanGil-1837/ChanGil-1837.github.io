'use client';

import { useState, useEffect, useRef } from "react";
import { MDXRemote } from 'next-mdx-remote'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Resizable } from "re-resizable";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

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

const HandleIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <div 
    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 cursor-ew-resize ${
      direction === 'left' ? '-left-6' : 'left-6'
    }`}
    onClick={(e) => e.stopPropagation()}
  >
    <div className={`w-0 h-0 border-t-8 border-b-8 ${direction === 'left' ? 'border-r-8 border-r-gray-500' : 'border-l-8 border-l-gray-500'} border-transparent`} />
  </div>
);

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageSrc, setLightboxImageSrc] = useState("");
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: '90vh' });
  const resizeFrame = useRef<number>();

  useEffect(() => {
    const savedWidth = localStorage.getItem('projectModalWidth');
    if (savedWidth) {
      setSize(prevSize => ({ ...prevSize, width: Number(savedWidth) }));
    }
    setIsShowing(true);
  }, []);

  const components = {
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
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    img: (props: any) => (
        <img
            {...props}
            className="cursor-pointer"
            onClick={() => {
                setLightboxImageSrc(props.src);
                setLightboxOpen(true);
            }}
        />
    ),
  }

  if (!project) return null;

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 flex justify-center items-center transition-opacity duration-300 ease-in-out backdrop-blur-sm ${
          isShowing ? 'bg-black bg-opacity-50' : 'bg-transparent'
        }`}
        onClick={() => !isResizing && handleClose()}
      >
        {isResizing && (
          <div className="fixed inset-0 z-50 cursor-ew-resize" />
        )}
        <Resizable
          size={{ width: size.width, height: size.height }}
          onResizeStart={() => setIsResizing(true)}
          onResize={(e, direction, ref, d) => {
            if (resizeFrame.current) cancelAnimationFrame(resizeFrame.current);
            resizeFrame.current = requestAnimationFrame(() => {
              const newWidth = size.width + d.width;
              setSize({ width: newWidth, height: size.height });
            });
          }}
          onResizeStop={(e, direction, ref, d) => {
            const newWidth = size.width + d.width;
            setSize({ width: newWidth, height: size.height });
            localStorage.setItem('projectModalWidth', String(newWidth));
            setIsResizing(false);
          }}
          enable={{ left: true, right: true }}
          handleComponent={{ right: <HandleIcon direction="right" />, left: <HandleIcon direction="left" /> }}
          minWidth={500}
          maxWidth="95vw"
          className={`relative transform transition-all duration-300 ease-in-out ${
              isShowing ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {isResizing && (
            <div
              className="absolute inset-0 z-50"
              style={{ background: 'transparent', cursor: 'ew-resize' }}
            />
          )}
          <div
            className={`bg-white dark:bg-gray-800 rounded-2xl p-8 w-full h-full overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-2xl font-bold z-50">&times;</button>
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
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: lightboxImageSrc }]} 
      />
    </>
  );
}
