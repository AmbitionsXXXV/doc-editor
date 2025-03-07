export default function Loader() {
	return (
		<div className="relative">
			<div className="relative mx-auto h-12 w-12 before:absolute before:top-[60px] before:left-0 before:h-[5px] before:w-12 before:animate-[var(--animate-loader-shadow)] before:rounded-full before:bg-[#f0808050] before:content-[''] after:absolute after:top-0 after:left-0 after:h-full after:w-full after:animate-[var(--animate-loader-jump)] after:rounded-md after:bg-[#f08080] after:content-['']"></div>
		</div>
	)
}
