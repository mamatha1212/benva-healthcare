import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import React from 'react';
import styles from './StaticPage.module.css';

export default async function StaticPageRender({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const page = await prisma.staticPage.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!page || !page.isActive) {
    notFound();
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.container}>
          <h1 className={styles.title}>{page.title}</h1>
        </div>
      </header>

      <main className={styles.container}>
        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </main>
    </div>
  );
}
