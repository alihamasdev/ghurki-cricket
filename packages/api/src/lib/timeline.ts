import type { TimelineData, TimelineFrame } from "./types";

export type TimelineRow = {
	dateId: Date | string;
	playerId: string;
};

/**
 * Builds cumulative racing leaderboard frames from chronologically sorted database entries.
 *
 * @param rows - Chronologically sorted database rows with dateId and playerId
 * @param getValue - Selector function returning the metric value for each row
 * @returns Object with unique player names and chronological cumulative frames
 */
export function buildRaceTimeline<T extends TimelineRow>(rows: T[], getValue: (row: T) => number): TimelineData {
	const dateMap = new Map<string, { playerId: string; value: number }[]>();

	for (const row of rows) {
		const dateStr = row.dateId instanceof Date ? (row.dateId.toISOString().split("T")[0] ?? "") : (String(row.dateId).split("T")[0] ?? "");

		if (!dateStr) continue;

		let list = dateMap.get(dateStr);

		if (!list) {
			list = [];
			dateMap.set(dateStr, list);
		}

		list.push({ playerId: row.playerId, value: getValue(row) });
	}

	const cumulative: Record<string, number> = {};
	const frames: TimelineFrame[] = [];

	for (const [date, playerEntries] of dateMap.entries()) {
		for (const entry of playerEntries) {
			cumulative[entry.playerId] = (cumulative[entry.playerId] ?? 0) + entry.value;
		}

		frames.push({ date, scores: { ...cumulative } });
	}

	return { players: Object.keys(cumulative), frames };
}
