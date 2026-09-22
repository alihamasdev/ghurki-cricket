import { domToBlob } from "modern-screenshot";
import { useCallback, useEffect, useRef } from "react";

type ImageCaptureProps = React.PropsWithChildren & {
	width?: number;
};

export function ImageCapture({ width = 50, children }: ImageCaptureProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	const handleCopyScreenshot = useCallback(async () => {
		const node = contentRef.current;
		if (!node) return;

		const originalWidth = node.style.width;

		try {
			node.style.width = `${width}%`;
			void node.offsetWidth;

			const blob = await domToBlob(node, { scale: 2, quality: 1 });

			if (blob) {
				await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
			}
		} catch (error) {
			console.error("Failed to copy screenshot to clipboard:", error);
		} finally {
			node.style.width = originalWidth;
		}
	}, [width]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				handleCopyScreenshot();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleCopyScreenshot]);

	return (
		<div ref={contentRef} className="w-full bg-background">
			{children}
		</div>
	);
}
