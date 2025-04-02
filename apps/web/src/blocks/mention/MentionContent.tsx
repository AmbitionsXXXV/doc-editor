import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link } from 'react-router'

import { Page } from '@/types/page'

interface MentionContentProps {
	pageId: string
}

export function MentionContent(props: MentionContentProps) {
	const { pageId } = props
	const { data: pages } = useQuery<Page[]>({
		queryKey: ['pages'],
	})

	const page = useMemo(() => {
		return pages?.find((page) => page.pageId === pageId)
	}, [pages])

	return (
		<Link
			to={`/doc/${pageId}`}
			className="mx-1 rounded-full bg-purple-200 px-2 py-[3px]"
		>
			<span className="mr-1">{page?.emoji}</span>
			{page?.title}
		</Link>
	)
}
