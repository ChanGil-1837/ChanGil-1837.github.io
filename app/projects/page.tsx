import RootLayout from "../layout";
import ProjectItem from "./project-item";

export default async function Projects() {
    const projects = await getPost();

    return (
        
        <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto">
                <div className="flex flex-col text-center w-full mb-20">
                    <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">프로젝트</h1>
                    <p className="lg:w-2/3 mx-auto leading-relaxed text-base">여태 수행한 프로젝트 목록입니다. </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 py-10 m-6 gap-8 sm:w-full" >  
                    {projects.map((project:any, index:any) => (
                        <ProjectItem key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export async function getPost() {

    const res = await fetch(process.env.NEXT_PUBLIC_NOTION_DATABASE, {
        cache: "no-store",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
            'Accept': 'application/json',
            'Authorization': process.env.NEXT_PUBLIC_NOTION_TOKEN
        },
        body: JSON.stringify({
            page_size: 100,
            sorts: [
                {
                    property: 'Work period',
                    direction: 'ascending'
                }
            ]
        }),
    });

    const data = await res.json();
    const projects = data.results.map((ctx:any) => {
        const title = ctx.properties?.Name?.title?.[0]?.text?.content || 'No Title';
        const description = ctx.properties?.Description?.rich_text?.[0]?.text?.content || 'No Description';
        const cover = ctx.cover.file.url
        const start = ctx.properties?.['Work period']?.date?.start || 'No Start Date';
        const end = ctx.properties?.['Work period']?.date?.end || 'No End Date';
        const link = ctx.properties?.link?.url || 'No End Date';
        const tags = ctx.properties?.Tags?.multi_select
        return {
            id: ctx.id,
            title,
            description,
            cover,
            start,end,link,tags
        };
    });
    console.log(projects)
    return projects;
}
