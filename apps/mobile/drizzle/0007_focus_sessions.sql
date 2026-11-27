CREATE TABLE `focus_session` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text,
	`session_date` text NOT NULL,
	`planned_seconds` integer NOT NULL,
	`focused_seconds` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `focus_session_date_idx` ON `focus_session` (`session_date`);