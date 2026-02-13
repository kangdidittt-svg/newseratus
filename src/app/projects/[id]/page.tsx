import ProjectDetail from '@/components/ProjectDetail';

interface PageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = params;
  return <ProjectDetail projectId={id} />;
}
