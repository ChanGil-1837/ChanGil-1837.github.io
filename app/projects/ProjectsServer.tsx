import ProjectsClient from './ProjectsClient';

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
      'Authorization': `${notionToken}`,
    },
    body: JSON.stringify({
      page_size: 100,
      sorts: [
        {
          property: 'Work period',
          direction: 'ascending',
        },
      ],
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch projects');

  const data = await res.json();
  if (!data.results) throw new Error('No results found in the response');

  return data.results.map((ctx: any) => {
    const title = ctx.properties?.Name?.title?.[0]?.text?.content || 'No Title';
    const description = ctx.properties?.Description?.rich_text?.[0]?.text?.content || 'No Description';
    const cover = ctx.cover?.file?.url || '';
    const start = ctx.properties?.['Work period']?.date?.start || 'No Start Date';
    const end = ctx.properties?.['Work period']?.date?.end || 'No End Date';
    const link = ctx.properties?.link?.url || 'No Link';
    const tags = ctx.properties?.Tags?.multi_select?.map((tag: any) => ({ name: tag.name })) || [];

    return { id: ctx.id, title, description, cover, start, end, link, tags };
  });
}

export default async function Projects() {
  let projects: Project[] = [];
  try {
    projects = await getProjects();
  } catch (e) {
    console.error(e);
    // fetch 실패 시 빈 배열 전달
    projects = [];
  }

  return <ProjectsClient projects={projects} />;
}
