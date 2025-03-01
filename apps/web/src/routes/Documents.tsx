import { Editor } from '@/editor/components'
import { Button } from '@/ui/button'
import { Edit, Share } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext, useParams } from 'react-router'

// 模拟文档数据
const MOCK_DOCUMENTS = [
	{ id: '1', title: '入门指南' },
	{ id: '2', title: 'API 文档' },
	{ id: '3', title: '使用教程' },
]

type ContextType = {
	userName: string | undefined
}

export function Documents() {
	const { documentId } = useParams()
	const [documents] = useState(MOCK_DOCUMENTS)
	const { userName } = useOutletContext<ContextType>()

	// 如果没有指定文档ID，使用第一个文档
	const activeDocId = documentId || '1'

	return (
		<div className="flex h-[calc(100vh-64px)]">
			{/* 文档内容区 */}
			<main className="flex-1 overflow-auto p-6">
				<div className="h-full flex flex-col">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold">
							{documents.find((doc) => doc.id === activeDocId)?.title || '新文档'}
						</h2>
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline">
								<Edit className="h-4 w-4 mr-1" />
								编辑
							</Button>
							<Button size="sm" variant="ghost">
								<Share className="h-4 w-4 mr-1" />
								分享
							</Button>
						</div>
					</div>

					<div className="border rounded-lg p-4 flex-1 bg-card">
						<Editor
							documentId={activeDocId}
							userName={userName}
							initialContent="<h2>开始编辑您的文档</h2><p>这是一个协作式文档编辑器，您可以邀请他人一起编辑。</p>"
						/>
					</div>
				</div>
			</main>
		</div>
	)
}

export default Documents
