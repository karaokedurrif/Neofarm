'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function FarmIndexPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      router.replace(`/farm/${slug}/dashboard`);
    }
  }, [slug, router]);

  return null;
}
