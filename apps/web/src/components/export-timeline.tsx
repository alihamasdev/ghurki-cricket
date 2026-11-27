import type { TimelineData } from "@ghurki-cricket/api/types";
import { env } from "@ghurki-cricket/env/web";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";

const exportResponseSchema = z.object({
	renderId: z.string(),
});

const progressResponseSchema = z.object({
	status: z.string(),
	progress: z.number(),
	error: z.string().optional(),
});

const errorResponseSchema = z.object({
	error: z.string().optional(),
});

type AspectRatio = "16:9" | "1:1";

type VideoSpeed = 1 | 1.5 | 2;

type ExportTimelineProps = {
	timeline: TimelineData;
	title: string;
	unit?: string;
};

export function ExportTimeline({ timeline, title, unit = "runs" }: ExportTimelineProps) {
	const isMobile = useIsMobile();
	const [open, setOpen] = useState(false);
	const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => (isMobile ? "1:1" : "16:9"));
	const [speed, setSpeed] = useState<VideoSpeed>(1);
	const [renderId, setRenderId] = useState<string | null>(null);

	const serverUrl = env.VITE_SERVER_URL;

	/**  Mutation to start the export job on the backend */
	const exportMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${serverUrl}/api/export-timeline`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					timeline,
					title,
					unit,
					aspectRatio,
					speed,
				}),
			});

			if (!res.ok) {
				const errorJson = await res.json().catch(() => ({}));
				const parsedError = errorResponseSchema.safeParse(errorJson);

				const errorMessage = parsedError.success && parsedError.data.error ? parsedError.data.error : `Server error: ${res.status}`;

				throw new Error(errorMessage);
			}

			const json = await res.json();
			const parsed = exportResponseSchema.safeParse(json);

			if (!parsed.success) {
				throw new Error("Invalid response from export server");
			}

			return parsed.data.renderId;
		},
		onSuccess: (newRenderId) => {
			setRenderId(newRenderId);
		},
		onError: (err: Error) => {
			alert(err.message || "Failed to start export");
		},
	});

	/** Query to poll render progress while active (persists whether sheet is open or closed) */
	const progressQuery = useQuery({
		queryKey: ["timeline-export-progress", serverUrl, renderId, aspectRatio, speed],
		queryFn: async () => {
			const res = await fetch(`${serverUrl}/api/export-timeline/progress/${renderId}`);

			if (!res.ok) {
				throw new Error("Failed to check render status");
			}

			const json = await res.json();
			const parsed = progressResponseSchema.safeParse(json);

			if (!parsed.success) {
				throw new Error("Invalid progress data");
			}

			const data = parsed.data;

			if (data.status === "error") {
				alert(`Export failed: ${data.error || "Unknown error"}`);
				setRenderId(null);
			} else if (data.status === "done") {
				const ratioSuffix = aspectRatio === "1:1" ? "square" : "landscape";
				const speedSuffix = speed === 1 ? "" : `-${speed}x`;
				const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${ratioSuffix}${speedSuffix}.mp4`;

				const downloadUrl = `${serverUrl}/api/export-timeline/download/${renderId}?filename=${encodeURIComponent(filename)}`;

				const link = document.createElement("a");
				link.href = downloadUrl;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				setRenderId(null);
			}

			return data;
		},
		enabled: Boolean(renderId),
		refetchInterval: (query) => {
			const status = query.state.data?.status;

			if (status === "done" || status === "error") {
				return false;
			}

			return 1000;
		},
	});

	const progressData = progressQuery.data;

	const isExporting = exportMutation.isPending || (Boolean(renderId) && progressData?.status !== "done");
	const sheetSide = isMobile ? "bottom" : "right";

	const handleStartExport = () => {
		exportMutation.mutate();
		setOpen(false);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button variant="secondary" disabled={isExporting} aria-label="Export Video">
						{isExporting ? <Spinner /> : <DownloadIcon />}
					</Button>
				}
			/>
			<SheetContent side={sheetSide} className={isMobile ? "max-h-4/5" : "sm:max-w-md"}>
				<SheetHeader>
					<SheetTitle>Export Timeline</SheetTitle>
				</SheetHeader>

				<div className="flex flex-col gap-6 p-4">
					<div className="flex flex-col gap-2">
						<Label>Aspect Ratio</Label>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setAspectRatio("16:9")}
								disabled={isExporting}
								className={cn(
									"flex flex-col items-center justify-center squircle border p-3 text-xs transition-colors first:font-semibold",
									aspectRatio === "16:9" ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
								)}
							>
								<div>16:9</div>
								<span>Landscape</span>
							</button>

							<button
								type="button"
								onClick={() => setAspectRatio("1:1")}
								disabled={isExporting}
								className={cn(
									"flex flex-col items-center justify-center squircle border p-3 text-xs transition-colors first:font-semibold",
									aspectRatio === "1:1" ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
								)}
							>
								<div>1:1</div>
								<span>Square</span>
							</button>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label>Playback Speed</Label>
						<div className="grid grid-cols-3 gap-2">
							{([1, 1.5, 2] as const).map((s) => {
								const isSelected = speed === s;

								return (
									<button
										key={s}
										type="button"
										onClick={() => setSpeed(s)}
										disabled={isExporting}
										className={cn(
											"flex items-center justify-center squircle border p-2 text-xs font-medium transition-colors",
											isSelected ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
										)}
									>
										<span>{s}x</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>

				<SheetFooter className="mt-0">
					<Button size="lg" onClick={handleStartExport} disabled={isExporting} className="w-full">
						Export
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
