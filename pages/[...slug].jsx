import path from 'path';
import {promises as fs} from 'fs';

import React from 'react';
import globby from 'globby';
import matter from 'gray-matter';

import markdownToHtml from '../lib/markdownToHtml';


import {moveImagesToPublicDirectory} from '../lib/images';

const MarkdownPages = ({navigationTree, content, data}) => {
  return (
    <>
      <h1>{data.title}</h1>
      <div dangerouslySetInnerHTML={{__html: content}} />
    </>
  );
};

export const getStaticPaths = async () => {
  const contentPath = path.join(process.cwd(), 'content');
  const paths = await globby([`${contentPath}/**/index.md`]);
  console.log(paths);
  const slugs = paths.map((path) => ({
    params: {
      slug: path
        .replace(`${process.cwd()}/content/`, '')
        .replace('/index.md', '')
        .split('/'),
    },
  }));

  moveImagesToPublicDirectory();

  return {
    // Pages that are statically built
    paths: slugs,
    // 404 for pages that do not match paths
    fallback: false,
  };
};

export const getStaticProps = async ({params}) => {
  const contentPath = path.join(process.cwd(), 'content');
  const fileSlug =
    params?.slug && Array.isArray(params.slug)
      ? `${params.slug.join('/')}`
      : '';
  const filePath = `${contentPath}/${fileSlug}/index.md`;
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const {content, data} = matter(fileContent);

  return {
    props: {
      content: await markdownToHtml(content),
      data,
    },
  };
};

export default MarkdownPages;
