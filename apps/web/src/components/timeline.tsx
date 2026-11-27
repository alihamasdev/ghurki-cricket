import { type TimelineData } from "@ghurki-cricket/api/types";
import { type ErrorFallback, Player } from "@remotion/player";
import { cn } from "cn";
import { AlertTriangleIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Img, prefetch, useCurrentFrame, useVideoConfig } from "remotion";

import { getPlayerImageUrl } from "@/components/avatar";
import { ExportTimeline } from "@/components/export-timeline";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useIsMobile } from "@/hooks/use-mobile";

/** Vertical gap between consecutive bars in pixels. */
const BAR_GAP = 20;

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
	aspectRatio?: "16:9" | "1:1";
	speed?: number;
};

/**
 * Remotion Composition component that renders the leaderboard race using Tailwind CSS flex layout.
 */
export function TimelineComposition({ timeline, title = "Timeline", unit = "runs" }: TimelineCompositionProps) {
	const frame = useCurrentFrame();
	const { durationInFrames, width, height } = useVideoConfig();

	const isSquare = width === 1080;
	// 16:9 (width 1920): left pad 56px (p-14) + line offset 48px + right margin ~336px = 440px
	// 1:1  (width 1080): left pad 32px (p-8)  + line offset 48px + right margin ~200px = 280px
	const availableBarWidth = Math.max(160, isSquare ? width - 280 : width - 440);

	// Layout vertical budget calculation:
	// Total canvas height = 1080px
	// verticalPadding = isSquare ? 64px (p-8 = 32px top + 32px bottom) : 112px (p-14 = 56px top + 56px bottom)
	// verticalGap = isSquare ? 48px (gap-6 = 24px * 2) : 112px (gap-14 = 56px * 2)
	// headerHeight ≈ 36px (text-3xl line-height)
	// footerHeight ≈ 32px (text-2xl line-height)
	const verticalPadding = isSquare ? 64 : 112;
	const verticalGaps = isSquare ? 48 : 112;
	const textContentHeights = 68; // header + footer
	const mainHeight = height - verticalPadding - verticalGaps - textContentHeights;

	// Distribute mainHeight evenly across 10 player slots:
	// 10 slots have 9 gaps of BAR_GAP (20px) = 180px of gaps
	const maxSlots = 10;
	const totalGapsHeight = (maxSlots - 1) * BAR_GAP;
	const barHeight = Math.max(40, Math.floor((mainHeight - totalGapsHeight) / maxSlots));
	const rowHeight = barHeight + BAR_GAP;
	const avatarSize = Math.max(32, Math.min(56, Math.round(barHeight * 0.72)));

	const frames = timeline.frames;

	if (frames.length === 0) {
		return (
			<div className="flex size-full items-center justify-center bg-background text-xl font-medium text-muted-foreground">
				No data available
			</div>
		);
	}

	const totalIntervals = Math.max(1, frames.length - 1);

	/** Precompute deterministic smooth vertical position trajectories for all players across all frames */
	const smoothPositions = useMemo(() => {
		const numFrames = Math.max(1, durationInFrames);
		const trajectories: Record<string, Float32Array> = {};

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
	}, [frames, durationInFrames, timeline.players, totalIntervals, rowHeight]);

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
		<div
			className={cn(
				"flex size-full flex-col justify-between overflow-hidden bg-background font-sans select-none",
				isSquare ? "gap-6 py-8" : "gap-14 p-14",
			)}
		>
			<header className="text-center text-3xl font-bold tracking-tight text-foreground">{title}</header>
			<main className="relative flex-1">
				<div className={cn("absolute top-0 bottom-3 w-1 rounded-full bg-border", isSquare ? "left-6" : "left-12")} />

				{visiblePlayers.map((player) => {
					const barWidth = Math.max(12, (player.runs / maxScore) * availableBarWidth);
					const barY = player.smoothY;
					const color = getPlayerColor(player.name);
					const avatarUrl = getPlayerImageUrl(player.name, "avatar");
					const opacity = Math.max(0, Math.min(1, (9.6 * rowHeight - barY) / (0.6 * rowHeight)));

					return (
						<div
							key={player.name}
							style={{ top: barY, width: barWidth, height: barHeight, backgroundColor: color, opacity }}
							className={cn("absolute flex items-center justify-end gap-3 rounded-r-lg pr-3 shadow-xs", isSquare ? "left-6" : "left-12")}
						>
							<div
								className="flex shrink-0 items-center justify-center overflow-hidden squircle bg-muted"
								style={{ width: avatarSize, height: avatarSize }}
							>
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
			<footer className={cn("text-right text-2xl font-semibold text-muted-foreground", isSquare && "pr-10")}>{currentDate}</footer>
		</div>
	);
}

type TimelineProps = {
	title: string;
	unit?: string;
	timeline: TimelineData;
};

export function Timeline({ title, unit = "runs", timeline }: TimelineProps) {
	const isMobile = useIsMobile();

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

	const frames = timeline.frames;
	const totalKeyframes = frames.length;
	const durationInSeconds = Math.max(15, Math.min(totalKeyframes * 1.5, 45));
	const totalFrames = Math.round(durationInSeconds * 60);

	const compositionWidth = isMobile ? 1080 : 1920;
	const compositionHeight = 1080;
	const aspectRatioStyle = isMobile ? "1 / 1" : "16 / 9";

	const renderErrorFallback: ErrorFallback = ({ error }) => {
		return (
			<Empty>
				<EmptyContent>
					<EmptyMedia variant="icon">
						<AlertTriangleIcon className="text-destructive" />
					</EmptyMedia>
					<EmptyTitle>Failed to render timeline</EmptyTitle>
					<EmptyDescription>{error?.message || "An unexpected error occurred while rendering the animation."}</EmptyDescription>
				</EmptyContent>
			</Empty>
		);
	};

	return (
		<div className="relative overflow-hidden rounded-md border bg-background">
			{import.meta.env.DEV && (
				<div className="absolute top-3 right-3 z-10">
					<ExportTimeline timeline={timeline} title={title} unit={unit} />
				</div>
			)}

			<Player
				component={TimelineComposition}
				inputProps={{
					timeline,
					title,
					unit,
					aspectRatio: isMobile ? "1:1" : "16:9",
				}}
				durationInFrames={totalFrames}
				compositionWidth={compositionWidth}
				compositionHeight={compositionHeight}
				style={{ width: "100%", aspectRatio: aspectRatioStyle }}
				fps={60}
				controls={false}
				loop={false}
				autoPlay
				moveToBeginningWhenEnded={false}
				acknowledgeRemotionLicense
				errorFallback={renderErrorFallback}
			/>
		</div>
	);
}
