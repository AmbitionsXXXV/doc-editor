export default function Loader() {
	return (
		<div className="relative">
			<div className="w-12 h-12 mx-auto relative before:content-[''] before:w-12 before:h-[5px] before:bg-[#f0808050] before:absolute before:top-[60px] before:left-0 before:rounded-full before:animate-[var(--animate-loaderShadow)] after:content-[''] after:w-full after:h-full after:bg-[#f08080] after:absolute after:top-0 after:left-0 after:rounded-md after:animate-[var(--animate-loaderJump)]"></div>
		</div>
	)
}
