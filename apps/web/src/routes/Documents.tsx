import { Mention } from '@/blocks/mention'
import {
	EtcDocSchema,
	defaultBlockSpecs,
	defaultInlineContentSpecs,
	defaultStyleSpecs,
} from '@doc-editor/core'
import { EtcDocView } from '@doc-editor/feature-ui'
import { useCreateEtcDoc } from '@doc-editor/react'
import { Button } from '@doc-editor/ui/button'
import { Edit, Share } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router'

// 模拟文档数据
const MOCK_DOCUMENTS = [
	{ id: '1', title: '入门指南' },
	{ id: '2', title: 'API 文档' },
	{ id: '3', title: '使用教程' },
]

// type ContextType = {
// 	userName: string | undefined
// }

export function Documents() {
	const { documentId } = useParams()
	const [documents] = useState(MOCK_DOCUMENTS)
	// const { userName } = useOutletContext<ContextType>()

	// 如果没有指定文档ID，使用第一个文档
	const activeDocId = documentId || '1'

	const schema = EtcDocSchema.create({
		inlineContentSpecs: {
			...defaultInlineContentSpecs,
			mention: Mention,
		},
		blockSpecs: {
			...defaultBlockSpecs,
		},
		styleSpecs: {
			...defaultStyleSpecs,
		},
	})

	const editor = useCreateEtcDoc({
		schema,
	})

	return (
		<div className="flex h-[calc(100vh-64px)]">
			{/* 文档内容区 */}
			<main className="flex-1 overflow-auto p-6">
				<div className="flex h-full flex-col">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="font-bold text-2xl">
							{documents.find((doc) => doc.id === activeDocId)?.title || '新文档'}
						</h2>
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline">
								<Edit className="mr-1 h-4 w-4" />
								编辑
							</Button>
							<Button size="sm" variant="ghost">
								<Share className="mr-1 h-4 w-4" />
								分享
							</Button>
						</div>
					</div>

					<EtcDocView editor={editor} />
					<div className="flex-1 rounded-lg border bg-card p-4"></div>
				</div>
			</main>
		</div>
	)
}

export default Documents
