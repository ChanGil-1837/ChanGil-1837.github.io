import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from "react";
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
    content: MDXRemoteSerializeResult;
    imageSlides: { src: string }[];
    relative: string[];
  };

export default function ProjectItem({ project, onProjectClick }: { project: Project, onProjectClick: (project: Project) => void }) {

    const { title, description, cover, start, end, tags } = project;

    const calculatedPeriod = (start:string, end:string) => {
        const startDateStringArray = start.split('-');
        const endDateStringArray = end.split('-');

        var startDate = new Date(Number(startDateStringArray[0]), Number(startDateStringArray[1]), Number(startDateStringArray[2]));
        var endDate = new Date(Number(endDateStringArray[0]), Number(endDateStringArray[1]), Number(endDateStringArray[2]));

        const diffInMs = Math.abs(endDate.getTime() - startDate.getTime());
        const result = diffInMs / (1000 * 60 * 60 * 24);
        return result;
    };

    function chunkTags(tags :any, size:number) {
        return tags.reduce((resultArray:any, item:any, index:number) => {
            const chunkIndex = Math.floor(index / size);

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []; // 시작 지점
            }

            resultArray[chunkIndex].push(item);

            return resultArray;
        }, []);
    }

    return (
        <div className="project-card cursor-pointer" onClick={() => onProjectClick(project)}>
            <Image
                className="rounded-t-xl w-full h-auto"
                src={cover}
                alt='Cover Img'
                width={500}
                height={300}
                style={{ objectFit: 'cover' }}
            />

            <div className="p-4 flex flex-col">
                <h1 className="text-2xl font-bold">{title}</h1>
                <h6 className="mt-4 text-lg">
                    {description.split('\n').map((line: string, i: number) => (
                        <span key={i}>{line}<br /></span>
                    ))}
                </h6>

                <p className="my-1 ">
                    작업기간 : {start} ~ {end} ({calculatedPeriod(start, end)}일)
                </p>
                <div className="mt-2">
                {chunkTags(tags, 5).map((chunk:any, index:number) => (
                    <div key={index} className="flex items-start">
                        {chunk.map((aTag:any) => (
                            <h1 key={aTag.id} className="px-2 py-1 mr-2 rounded-md bg-sky-200 dark:bg-sky-700 w-30">
                                {aTag.name}
                            </h1>
                        ))}
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}