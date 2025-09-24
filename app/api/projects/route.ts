import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';

type Project = {
  id: string;
  title: string;
  description: string;
  cover: string;
  start: string;
  end: string;
  link: string;
  tags: Array<{ name: string }>;
  slug:string;
  content: any;
  imageSlides: { src: string }[];
  relative: string[];
};

const projectsDirectory = path.join(process.cwd(), '_projects');

async function getProjects(locale: string): Promise<Project[]> {
  const notionToken = process.env.NEXT_PUBLIC_NOTION_TOKEN;
  const notionDatabaseId = process.env.NEXT_PUBLIC_NOTION_DATABASE;

  if (!notionToken || !notionDatabaseId) {
    throw new Error('NEXT_PUBLIC_NOTION_TOKEN or NEXT_PUBLIC_NOTION_DATABASE is not set in environment variables.');
  }

  const res = await fetch(notionDatabaseId, {
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
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    }),
    next: { revalidate: 600 },
  });

  if (!res.ok) throw new Error('Failed to fetch projects from Notion');

  const data = await res.json();
  
  if (!data.results) throw new Error('No results found in the Notion response');

  const projects = await Promise.all(data.results.map(async (ctx: any) => {
    const isJP = locale.toUpperCase() === 'JP';
    
    const title = (isJP ? ctx.properties?.JPName?.rich_text?.[0]?.text?.content : ctx.properties?.Name?.title?.[0]?.text?.content) || 'No Title';
    const description = (isJP ? ctx.properties?.JPDesc?.rich_text : ctx.properties?.Description?.rich_text)
      ?.map((textBlock: any) => textBlock.text?.content || '')
      .join('\n') || 'No Description';
    const slug = ctx.properties?.slug?.rich_text?.[0]?.text?.content || null;
    let cover = ctx.cover?.file?.url || '';
    if (slug) {
      const imageDir = path.join(process.cwd(), 'public', '_projects', slug);
      try {
        const files = fs.readdirSync(imageDir);
        const imageFile = files.find(file => !file.startsWith('.')); // Ignore files like .DS_Store
        if (imageFile) {
          cover = `/_projects/${slug}/${imageFile}`;
        }
      } catch (e) {
        // console.log(`No local cover image for slug ${slug}, using Notion cover.`);
      }
    }
    const start = ctx.properties?.['Work period']?.date?.start || 'No Start Date';
    const end = ctx.properties?.['Work period']?.date?.end || 'No End Date';
    const link = ctx.properties?.link?.url || 'No Link';
    const tags = ctx.properties?.Tags?.multi_select?.map((tag: any) => ({ name: tag.name })) || [];
    const relative = ctx.properties?.relative?.rich_text?.[0]?.text?.content?.split(',').map((s: string) => s.trim()) || [];

    let contentSource = description; // Default to description
    if (slug) {
      const localePath = isJP ? 'JP' : 'KR';
      const fullPath = path.join(projectsDirectory, localePath, `${slug}.mdx`);
      try {
        contentSource = fs.readFileSync(fullPath, 'utf8');
      } catch (err) {
        console.error(`MDX file not found for slug: ${slug} in ${localePath}. Falling back to description.`);
      }
    }

    const serializedContent = await serialize(contentSource, {
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [],
        },
        parseFrontmatter: true,
    });

    const imageRegex = /!\[.*\]\\((.*?)\\)/g;
    const matches = [...contentSource.matchAll(imageRegex)];
    const imageSlides = matches.map(match => ({ src: match[1] }));
    
    return { id: ctx.id, title, description, cover, start, end, link, tags, slug, content: serializedContent, imageSlides, relative };
  }));

  return projects;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'KR';
  try {
    const projects = await getProjects(locale);
    return NextResponse.json({ projects });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}