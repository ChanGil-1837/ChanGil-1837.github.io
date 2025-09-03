import ProjectItem from "./project-item";

type Project = {
  id: string;
  title: string;
  description: string;
  cover: string;
  start: string;
  end: string;
  link: string;
  tags: Array<{ name: string }>;
};

async function getProjects(): Promise<Project[]> {
  const notionToken = process.env.NEXT_PUBLIC_NOTION_TOKEN;
  const notionDatabaseId = process.env.NEXT_PUBLIC_NOTION_DATABASE;

  if (!notionToken || !notionDatabaseId) {
    throw new Error('NEXT_PUBLIC_NOTION_TOKEN or NEXT_PUBLIC_NOTION_DATABASE is not set in environment variables.');
  }

  const res = await fetch(notionDatabaseId, {
    cache: 'no-store',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      'Accept': 'application/json',
      'Authorization': `${notionToken}`
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

  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data = await res.json();
  console.log('Fetched data from Notion:', JSON.stringify(data, null, 2));
  if (!data.results) {
    throw new Error('No results found in the response');
  }

  return data.results.map((ctx: any) => {
    const title = ctx.properties?.Name?.title?.[0]?.text?.content || 'No Title';
    const description = ctx.properties?.Description?.rich_text?.[0]?.text?.content || 'No Description';
    const cover = ctx.cover?.file?.url || '';
    const start = ctx.properties?.['Work period']?.date?.start || 'No Start Date';
    const end = ctx.properties?.['Work period']?.date?.end || 'No End Date';
    const link = ctx.properties?.link?.url || 'No Link';
    const tags = ctx.properties?.Tags?.multi_select?.map((tag: any) => ({ name: tag.name })) || [];

    return {
      id: ctx.id,
      title,
      description,
      cover,
      start,
      end,
      link,
      tags,
    };
  });
}

export default async function Projects() {
  let projects: Project[] = [];
  let error: any = null;

  try {
    projects = await getProjects();
  } catch (e) {
    console.error(e);
    error = e;
  }

  if (error || !projects || projects.length === 0) {
    return (
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-col text-center w-full mb-20">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">프로젝트</h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
              {error ? error.message : '프로젝트가 없거나 가져오는 중 오류가 발생했습니다.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">프로젝트</h1>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base">여태 수행한 프로젝트 목록입니다. </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 py-10 m-6 gap-8 sm:w-full">
          {projects.map((project: Project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

