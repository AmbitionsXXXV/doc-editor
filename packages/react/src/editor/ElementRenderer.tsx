import React, { useImperativeHandle, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'

/**
 * 用于将单个元素渲染到指定容器的辅助组件，便于后续读取 DOM/HTML 内容
 *
 * 这对于在正确上下文中渲染任意 React 元素（如 block）很有用（由 ReactRenderUtil 使用）
 */
export function ElementRenderer(
	_props: {},
	ref?: React.Ref<(node: React.ReactNode, container: HTMLElement) => void>,
) {
	const [singleRenderData, setSingleRenderData] = useState<
		{ node: React.ReactNode; container: HTMLElement } | undefined
	>()

	useImperativeHandle(
		ref,
		() => {
			return (node: React.ReactNode, container: HTMLElement) => {
				flushSync(() => {
					setSingleRenderData({ node, container })
				})

				// 渲染到 container 后清除
				setSingleRenderData(undefined)
			}
		},
		[],
	)

	return (
		<>
			{singleRenderData &&
				createPortal(singleRenderData.node, singleRenderData.container)}
		</>
	)
}

ElementRenderer.displayName = 'ElementRenderer'
