import { type TimelineData } from "@ghurki-cricket/api/types";
import { env } from "@ghurki-cricket/env/web";
import { Player } from "@remotion/player";
import { DownloadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Img, prefetch, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { getPlayerImageUrl } from "@/components/avatar";
import { Button } from "@/components/ui/button";

import { Spinner } from "./ui/spinner";

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

/** Internal composition width in pixels (1080p standard: w-480). */
const CANVAS_WIDTH = 1920;

/** Internal composition height in pixels (1080p standard: h-270). */
const CANVAS_HEIGHT = 1080;

/** Height of each horizontal ranking bar in pixels. */
const BAR_HEIGHT = 60;

/** Vertical gap between consecutive bars in pixels. */
const BAR_GAP = 20;

/** Maximum available width in pixels for the longest bar. */
const AVAILABLE_BAR_WIDTH = 1480;

/** Color palette for player bars. */
const PALETTE = [
	"#3b82f6", // blue
	"#10b981", // emerald
	"#f59e0b", // amber
	"#ef4444", // red
	"#8b5cf6", // purple
	"#06b6d4", // cyan
	"#ec4899", // pink
	"#14b8a6", // teal
	"#f97316", // orange
	"#6366f1", // indigo
	"#84cc16", // lime
	"#a855f7", // violet
	"#0284c7", // sky
	"#d97706", // amber-dark
	"#d946ef", // fuchsia
];

/**
 * Returns a consistent distinct color for a given player name.
 */
function getPlayerColor(name: string): string {
	let hash = 0;

	for (let i = 0; i < name.length; i++) {
		hash = (hash << 5) - hash + name.charCodeAt(i);
		hash |= 0;
	}

	const index = Math.abs(hash) % PALETTE.length;

	return PALETTE[index] ?? "#3b82f6";
}

export type TimelineCompositionProps = {
	timeline: TimelineData;
	title?: string;
	unit?: string;
};

/**
 * Remotion Composition component that renders the leaderboard race using Tailwind CSS flex layout.
 */
export function TimelineComposition({ timeline, title = "Most Batting Runs", unit = "runs" }: TimelineCompositionProps) {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const frames = timeline.frames;

	if (frames.length === 0) {
		return (
			<div className="flex size-full items-center justify-center bg-background text-xl font-medium text-muted-foreground">
				No data available
			</div>
		);
	}

	const totalIntervals = Math.max(1, frames.length - 1);

	// Precompute deterministic smooth vertical position trajectories for all players across all frames
	const smoothPositions = useMemo(() => {
		const numFrames = Math.max(1, durationInFrames);
		const trajectories: Record<string, Float32Array> = {};
		const rowHeight = BAR_HEIGHT + BAR_GAP;

		for (const p of timeline.players) {
			trajectories[p] = new Float32Array(numFrames);
		}

		// Initial frame rankings at f = 0
		const initialFrame = frames[0];

		const initialScores = timeline.players.map((p) => ({
			name: p,
			runs: initialFrame?.scores[p] ?? 0,
		}));

		initialScores.sort((a, b) => {
			if (b.runs !== a.runs) return b.runs - a.runs;

			return a.name.localeCompare(b.name);
		});

		for (let i = 0; i < initialScores.length; i++) {
			const p = initialScores[i]!.name;
			trajectories[p][0] = i * rowHeight;
		}

		const smoothingFactor = 0.08;

		for (let f = 1; f < numFrames; f++) {
			const progress = numFrames > 1 ? f / (numFrames - 1) : 0;
			const scaledT = Math.min(progress * totalIntervals, totalIntervals);
			const fIdx = Math.min(Math.floor(scaledT), totalIntervals - 1);
			const a = scaledT - fIdx;

			const curF = frames[fIdx];
			const nextF = frames[Math.min(fIdx + 1, frames.length - 1)];

			const frameScores = timeline.players.map((p) => {
				const start = curF?.scores[p] ?? 0;
				const end = nextF?.scores[p] ?? start;

				return {
					name: p,
					runs: start + (end - start) * a,
				};
			});

			frameScores.sort((a, b) => {
				if (b.runs !== a.runs) return b.runs - a.runs;

				return a.name.localeCompare(b.name);
			});

			for (let rank = 0; rank < frameScores.length; rank++) {
				const p = frameScores[rank]!.name;
				const targetY = rank * rowHeight;
				const prevY = trajectories[p]![f - 1]!;
				trajectories[p]![f] = prevY + (targetY - prevY) * smoothingFactor;
			}
		}

		return trajectories;
	}, [frames, durationInFrames, timeline.players, totalIntervals]);

	// Calculate progress t from current frame (0 at frame 0, 1 at durationInFrames - 1)
	const t = durationInFrames > 1 ? frame / (durationInFrames - 1) : 0;
	const scaledT = Math.min(t * totalIntervals, totalIntervals);
	const frameIdx = Math.min(Math.floor(scaledT), totalIntervals - 1);
	const alpha = scaledT - frameIdx;

	const currentFrame = frames[frameIdx];
	const nextFrame = frames[Math.min(frameIdx + 1, frames.length - 1)];

	const scores: Record<string, number> = {};

	for (const player of timeline.players) {
		const startScore = currentFrame?.scores[player] ?? 0;
		const endScore = nextFrame?.scores[player] ?? startScore;
		scores[player] = startScore + (endScore - startScore) * alpha;
	}

	const clampedFrame = Math.min(Math.max(0, Math.floor(frame)), durationInFrames - 1);
	const rowHeight = BAR_HEIGHT + BAR_GAP;

	const sortedAll = timeline.players
		.map((p) => ({
			name: p,
			runs: scores[p] ?? 0,
			smoothY: smoothPositions[p]?.[clampedFrame] ?? 0,
		}))
		.filter((p) => p.runs > 0);

	sortedAll.sort((a, b) => a.smoothY - b.smoothY);

	const maxScore = Math.max(timeline.players.reduce((max, p) => Math.max(max, scores[p] ?? 0), 0) * 1.15, 3);

	const currentDate = (alpha >= 0.5 ? nextFrame : currentFrame)?.date ?? currentFrame?.date ?? "";

	const visiblePlayers = sortedAll.filter((p) => p.smoothY < 9.6 * rowHeight);

	return (
		<div className="flex h-270 w-480 flex-col justify-between gap-14 overflow-hidden bg-background p-14 font-sans select-none">
			<header className="text-center text-3xl font-bold tracking-tight text-foreground">{title}</header>
			<main className="relative flex-1">
				<div className="absolute top-0 bottom-3 left-12 w-1 rounded-full bg-border" />

				{visiblePlayers.map((player) => {
					const barWidth = Math.max(12, (player.runs / maxScore) * AVAILABLE_BAR_WIDTH);
					const barY = player.smoothY;
					const color = getPlayerColor(player.name);
					const avatarUrl = getPlayerImageUrl(player.name, "avatar");
					const opacity = Math.max(0, Math.min(1, (9.6 * rowHeight - barY) / (0.6 * rowHeight)));

					return (
						<div
							key={player.name}
							className="absolute left-12 flex h-15 items-center justify-end gap-3 rounded-r-lg pr-3 shadow-xs"
							style={{ top: barY, width: barWidth, backgroundColor: color, opacity }}
						>
							<div className="flex size-10 shrink-0 items-center justify-center overflow-hidden squircle bg-muted">
								<Img
									src={avatarUrl}
									alt={player.name}
									className="size-full object-cover"
									maxRetries={0}
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
								/>
							</div>

							<div className="truncate pr-3 text-xl font-semibold whitespace-nowrap text-white">{player.name}</div>

							<div className="absolute left-full ml-4 text-2xl font-semibold whitespace-nowrap text-foreground">
								{Math.round(player.runs).toLocaleString()} {unit}
							</div>
						</div>
					);
				})}
			</main>
			<footer className="text-right text-2xl font-semibold text-muted-foreground">{currentDate}</footer>
		</div>
	);
}

type TimelineProps = {
	title: string;
	unit?: string;
	timeline: TimelineData;
};

export function Timeline({ title, unit = "runs", timeline }: TimelineProps) {
	const [exportState, setExportState] = useState<{
		isExporting: boolean;
		progress: number;
		status: string;
	}>({
		isExporting: false,
		progress: 0,
		status: "",
	});

	useEffect(() => {
		const prefetches = timeline.players.map((player) => {
			const url = getPlayerImageUrl(player, "avatar");

			return url ? prefetch(url, { method: "blob-url" }) : null;
		});

		return () => {
			for (const p of prefetches) {
				p?.free();
			}
		};
	}, [timeline.players]);

	const handleExport = async () => {
		if (exportState.isExporting) return;

		setExportState({ isExporting: true, progress: 0, status: "Starting..." });

		try {
			const serverUrl = env.VITE_SERVER_URL.replace(/\/+$/, "");

			const res = await fetch(`${serverUrl}/api/export-timeline`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ timeline, title, unit }),
			});

			if (!res.ok) {
				const errorJson = await res.json().catch(() => ({}));
				const parsedError = errorResponseSchema.safeParse(errorJson);
				const errorMessage = parsedError.success && parsedError.data.error ? parsedError.data.error : `Server error: ${res.status}`;
				throw new Error(errorMessage);
			}

			const json = await res.json();
			const parsedStart = exportResponseSchema.safeParse(json);

			if (!parsedStart.success) {
				throw new Error("Invalid response from export server");
			}

			const renderId = parsedStart.data.renderId;

			const pollInterval = setInterval(async () => {
				try {
					const progRes = await fetch(`${serverUrl}/api/export-timeline/progress/${renderId}`);

					if (!progRes.ok) return;

					const progJson = await progRes.json();
					const parsedProgress = progressResponseSchema.safeParse(progJson);

					if (!parsedProgress.success) return;

					const progData = parsedProgress.data;

					if (progData.status === "error") {
						clearInterval(pollInterval);
						setExportState({ isExporting: false, progress: 0, status: "" });
						alert(`Export failed: ${progData.error || "Unknown error"}`);

						return;
					}

					setExportState({
						isExporting: true,
						progress: progData.progress,
						status: progData.status === "bundling" ? "Compiling..." : `Rendering ${progData.progress}%`,
					});

					if (progData.status === "done") {
						clearInterval(pollInterval);
						setExportState({ isExporting: false, progress: 100, status: "" });

						const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mp4`;

						const downloadUrl = `${serverUrl}/api/export-timeline/download/${renderId}?filename=${encodeURIComponent(filename)}`;

						const link = document.createElement("a");
						link.href = downloadUrl;
						link.download = filename;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}
				} catch {
					// Ignore transient poll failure
				}
			}, 1000);
		} catch (err: unknown) {
			setExportState({ isExporting: false, progress: 0, status: "" });
			alert(err instanceof Error ? err.message : "Failed to start export");
		}
	};

	const frames = timeline.frames;
	const totalKeyframes = frames.length;
	const durationInSeconds = Math.max(15, Math.min(totalKeyframes * 1.5, 45));
	const totalFrames = Math.round(durationInSeconds * 60);

	return (
		<div className="relative overflow-hidden rounded-md border bg-background">
			{import.meta.env.DEV && (
				<div className="absolute top-4 right-4 z-10">
					<Button size="icon" variant="secondary" disabled={exportState.isExporting} onClick={handleExport}>
						{exportState.isExporting ? <Spinner /> : <DownloadIcon />}
					</Button>
				</div>
			)}

			<Player
				component={TimelineComposition}
				inputProps={{ timeline, title, unit }}
				durationInFrames={totalFrames}
				compositionWidth={CANVAS_WIDTH}
				compositionHeight={CANVAS_HEIGHT}
				style={{ width: "100%", aspectRatio: "16 / 9" }}
				fps={60}
				controls={false}
				loop={false}
				autoPlay
				moveToBeginningWhenEnded={false}
				acknowledgeRemotionLicense
			/>
		</div>
	);
}
