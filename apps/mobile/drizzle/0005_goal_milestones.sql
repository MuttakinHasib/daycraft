CREATE TABLE `goal_milestone` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`done` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `goal_milestone_goal_idx` ON `goal_milestone` (`goal_id`,`position`);