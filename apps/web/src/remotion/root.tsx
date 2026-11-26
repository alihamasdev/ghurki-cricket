import type { TimelineData } from "@ghurki-cricket/api/types";
import { Composition } from "remotion";

import { TimelineComposition, type TimelineCompositionProps } from "@/components/timeline";

const defaultTimeline: TimelineData = {
	frames: [],
	players: [],
};

export function RemotionRoot() {
	return (
		<Composition
			id="TimelineRace"
			component={TimelineComposition}
			durationInFrames={900}
			fps={60}
			width={1920}
			height={1080}
			defaultProps={
				{
					timeline: defaultTimeline,
					title: "Most Batting Runs",
					unit: "runs",
				} satisfies TimelineCompositionProps
			}
			calculateMetadata={({ props }) => {
				const frames = props.timeline?.frames ?? [];
				const totalKeyframes = frames.length;
				const durationInSeconds = Math.max(15, Math.min(totalKeyframes * 1.5, 45));
				const totalFrames = Math.max(60, Math.round(durationInSeconds * 60));

				return {
					durationInFrames: totalFrames,
				};
			}}
		/>
	);
}
