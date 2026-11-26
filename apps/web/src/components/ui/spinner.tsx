import { cn } from "cn";

export function Spinner({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<>
			<style>{`
        @keyframes loading-ui-classic-fade {
          0% {
            opacity: 1;
          }

          100% {
            opacity: 0.15;
          }
        }
      `}</style>
			<span data-slot="spinner" role="status" className={cn("box-border inline-block size-5", className)} {...props}>
				<span aria-hidden="true" className="relative top-1/2 left-1/2 block size-full">
					{Array.from({ length: 12 }, (_, index) => (
						<span
							key={index}
							className="absolute block rounded-lg bg-current"
							style={{
								top: "-3.9%",
								left: "-10%",
								height: "8%",
								width: "24%",
								transform: `rotate(${index * 30}deg) translate(146%)`,
								animation: "loading-ui-classic-fade var(--duration, 1.2s) linear infinite",
								animationDelay: `calc(var(--duration, 1.2s) / 12 * ${index - 12})`,
							}}
						/>
					))}
				</span>
				<span className="sr-only">Loading</span>
			</span>
		</>
	);
}
